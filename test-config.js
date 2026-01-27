// 简单的环境变量测试脚本
console.log('=== 环境变量检查 ===')
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL)
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...')
console.log('VITE_DOUBAO_API_KEY:', process.env.VITE_DOUBAO_API_KEY?.substring(0, 10) + '...')

// 配置验证
const config = {
  hasSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
  hasApiKey: !!process.env.VITE_DOUBAO_API_KEY,
  urlValid: process.env.VITE_SUPABASE_URL?.includes('supabase.co')
}

console.log('\n=== 配置验证结果 ===')
Object.entries(config).forEach(([key, value]) => {
  console.log(`${key}: ${value ? '✅' : '❌'}`)
})

if (config.hasSupabaseUrl && config.hasApiKey && config.urlValid) {
  console.log('\n🎉 所有配置都正确！可以继续开发。')
} else {
  console.log('\n⚠️ 配置有误，请检查 .env.local 文件')
}