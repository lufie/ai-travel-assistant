-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    provider TEXT NOT NULL, -- 'google', 'wechat'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建保存的行程表
CREATE TABLE IF NOT EXISTS saved_itineraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    destination_id TEXT NOT NULL, -- 关联目的地ID
    destination_name TEXT NOT NULL, -- 目的地名称
    data JSONB NOT NULL, -- 行程数据
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_saved_itineraries_user_id ON saved_itineraries(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_itineraries_destination_id ON saved_itineraries(destination_id);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为用户表创建触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 为保存的行程表创建触发器
DROP TRIGGER IF EXISTS update_saved_itineraries_updated_at ON saved_itineraries;
CREATE TRIGGER update_saved_itineraries_updated_at
    BEFORE UPDATE ON saved_itineraries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();