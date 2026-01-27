
import { Destination } from './types';

export const COLORS = {
  primary: '#FF6B35', 
  secondary: '#4ECDC4', 
  bg: '#F8F9FA',
  text: '#2D3436',
  muted: '#636E72'
};

const generateMockNotes = (name: string) => [
  {
    id: `note-${name}-1`,
    author: '摄影师阿力',
    likes: 1250,
    content: `${name}的落日真的绝美！推荐在下午5点左右到达观景台，光影效果无敌。`,
    imageUrl: `https://picsum.photos/seed/${name}1/300/400`
  },
  {
    id: `note-${name}-2`,
    author: '遛娃专家',
    likes: 890,
    content: `带娃去${name}避坑指南：一定要提前准备好防晒和零食，里面的餐厅排队比较久。`,
    imageUrl: `https://picsum.photos/seed/${name}2/300/400`
  }
];

export const MOCK_DESTINATIONS: Destination[] = [
  // 目的地 (Nature/Scenic)
  { id: '1', type: 'destination', name: '雁栖湖', location: '北京怀柔', lat: 40.395, lng: 116.685, rating: 4.8, tags: ['热门', '亲子'], travelTime: '25m', suggestedTransport: '自驾', suggestedDuration: '1天', budget: '¥200', description: '北方的西湖。', aiReason: '环境极其优美。', imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=300&q=80', distance: '15km', notes: generateMockNotes('雁栖湖') },
  { id: '2', type: 'destination', name: '慕田峪长城', location: '北京怀柔', lat: 40.431, lng: 116.562, rating: 4.9, tags: ['雄伟', '必去'], travelTime: '45m', suggestedTransport: '自驾', suggestedDuration: '0.5天', budget: '¥150', description: '长城精华。', aiReason: '索道直达，适合带老人。', imageUrl: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=300&q=80', distance: '28km', notes: generateMockNotes('慕田峪') },
  { id: '3', type: 'destination', name: '奥林匹克森林公园', location: '北京朝阳', lat: 40.015, lng: 116.392, rating: 4.7, tags: ['跑步', '氧吧'], travelTime: '15m', suggestedTransport: '地铁', suggestedDuration: '3小时', budget: '免费', description: '城市绿肺。', aiReason: '全亚洲最大的城市绿化景观。', imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=300&q=80', distance: '5km', notes: generateMockNotes('奥森') },
  
  // 高铁 (HSR)
  { id: 'hsr-1', type: 'hsr', name: '天津意式风情区', location: '天津', lat: 39.135, lng: 117.200, rating: 4.5, price: '¥54.5', tags: ['欧式', '摄影'], travelTime: '30m', suggestedTransport: '高铁', suggestedDuration: '1天', budget: '¥400', description: '假装在欧洲。', aiReason: '异域风情浓郁，拍照极佳。', imageUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=300&q=80', distance: '120km', notes: generateMockNotes('天津') },
  { id: 'hsr-2', type: 'hsr', name: '北戴河海滩', location: '秦皇岛', lat: 39.820, lng: 119.480, rating: 4.6, price: '¥140', tags: ['海边', '避暑'], travelTime: '2h', suggestedTransport: '高铁', suggestedDuration: '2天', budget: '¥800', description: '距离北京最近的大海。', aiReason: '看海首选，配套设施成熟。', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80', distance: '280km', notes: generateMockNotes('北戴河') },

  // 自驾 (Drive)
  { id: 'drive-1', type: 'drive', name: '金海湖', location: '平谷', lat: 40.180, lng: 117.330, rating: 4.6, tags: ['露营', '游艇'], travelTime: '1.5h', distance: '85km', suggestedTransport: '自驾', suggestedDuration: '1天', budget: '¥300', description: '京郊小瑞士。', aiReason: '水域开阔，草坪质量高。', imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=300&q=80', notes: generateMockNotes('金海湖') },
  { id: 'drive-2', type: 'drive', name: '草原天路', location: '张家口', lat: 41.150, lng: 114.900, rating: 4.8, tags: ['绝美', '公路'], travelTime: '3.5h', distance: '220km', suggestedTransport: '自驾', suggestedDuration: '2天', budget: '¥600', description: '中国的66号公路。', aiReason: '景色变幻莫测，驾驶感极佳。', imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=80', notes: generateMockNotes('天路') },

  // 酒店 (Hotel)
  { id: 'hotel-1', type: 'hotel', name: '日出东方凯宾斯基', location: '怀柔', lat: 40.390, lng: 116.690, rating: 4.9, price: '¥1888', tags: ['地标', '奢华'], travelTime: '1h', distance: '60km', suggestedTransport: '自驾', suggestedDuration: '1晚', budget: '¥2000', description: '发光的扇贝建筑。', aiReason: '湖景落地窗，顶级配套。', imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80', notes: generateMockNotes('日出东方') },
  { id: 'hotel-2', type: 'hotel', name: '长城脚下的公社', location: '延庆', lat: 40.355, lng: 116.015, rating: 4.8, price: '¥2500', tags: ['设计', '山居'], travelTime: '1.2h', distance: '70km', suggestedTransport: '自驾', suggestedDuration: '1晚', budget: '¥3000', description: '全球著名设计酒店。', aiReason: '住在艺术品里看长城。', imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=300&q=80', notes: generateMockNotes('公社') },

  // 博物馆 (Museum/Art)
  { id: 'museum-1', type: 'museum', name: '红砖美术馆', location: '崔各庄', lat: 40.035, lng: 116.510, rating: 4.7, price: '¥120', tags: ['红砖', '艺术'], travelTime: '30m', distance: '12km', suggestedTransport: '打车', suggestedDuration: '3小时', budget: '¥150', description: '园林式美术馆。', aiReason: '光影交织，出片率100%。', imageUrl: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=300&q=80', notes: generateMockNotes('红砖') },
  { id: 'museum-2', type: 'museum', name: '中国油画院', location: '高碑店', lat: 39.902, lng: 116.535, rating: 4.6, price: '免费', tags: ['白色教堂', '圣洁'], travelTime: '20m', distance: '8km', suggestedTransport: '自驾', suggestedDuration: '2小时', budget: '¥50', description: '极简主义美学巅峰。', aiReason: '著名的白色礼堂就在这里。', imageUrl: 'https://images.unsplash.com/photo-1493106819501-66d381c466f1?auto=format&fit=crop&w=300&q=80', notes: generateMockNotes('油画院') },
];
