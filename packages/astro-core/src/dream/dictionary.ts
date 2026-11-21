import { DreamCategory, DreamEntry } from './types.js';
import dreamJson from '../../data/dream-dictionary.json';

export const DREAM_CATEGORIES: {
  key: DreamCategory;
  name: string;
  icon: string;
  description: string;
}[] = [
  { key: 'nature', name: '天文日月風雨山川', icon: '🌊', description: '日月星辰、風霜雨雪、江河湖海、山崩地裂與大水洪濤' },
  { key: 'body', name: '身體毛髮血淚生理', icon: '🦷', description: '掉牙、掉髮、流血、哭泣、病痛、赤身裸體與肢體變化' },
  { key: 'animal', name: '飛禽走獸鱗介蟲魚', icon: '🐍', description: '蛇、龍、魚、犬、貓、虎、鳥雀、牛馬與昆蟲群蜂' },
  { key: 'plant', name: '花草樹木果實農稼', icon: '🌿', description: '春木開花、碩果纍纍、伐木、五穀豐收與芳草林幽' },
  { key: 'building', name: '房屋居室門窗橋樑', icon: '🏛️', description: '起蓋高樓、門窗開闔、樑傾棟折、過橋行路與庭階幽深' },
  { key: 'wealth', name: '金銀財帛衣冠器用', icon: '🪙', description: '拾金得寶、裁衣著冠、明鏡破裂、刀劍在握與珠玉成堆' },
  { key: 'event', name: '生死婚喪墜落奔逃', icon: '⏳', description: '死人棺槨、大火燔柴、高空墜落、被人追逐與婚慶迎親' },
  { key: 'spiritual', name: '神佛仙官幽冥鬼神', icon: '✨', description: '如來觀音、仙真降凡、幽魂索債、登壇祈禳與寺觀瞻禮' },
];

export const DREAM_DICTIONARY: DreamEntry[] = dreamJson as DreamEntry[];
