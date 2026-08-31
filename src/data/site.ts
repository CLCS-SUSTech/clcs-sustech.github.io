import type { Lang } from '@/lib/paths';

export const siteFeatures = {
  join: false,
} as const;

export const lab = {
  nameZh: '计算语言学与意识科学实验室',
  nameEn: 'Computational Linguistics & Consciousness Sciences Lab',
  shortName: 'CLCS Lab',
  universityZh: '南方科技大学',
  universityEn: 'Southern University of Science and Technology',
  universityUrl: 'https://www.sustech.edu.cn/',
  departmentZh: '计算机科学与工程系',
  departmentEn: 'Department of Computer Science and Engineering',
  departmentUrl: 'https://cse.sustech.edu.cn/',
  mentorAcademicTitleZh: '副教授',
  mentorAcademicTitleEn: 'Associate Professor',
  mentorCvUrl: 'files/cv-xu.pdf',
  mentorCvZhUrl: 'files/cv-xu_zh.pdf',
  email: 'xuyang [at] sustech [dot] edu [dot] cn',
  locationZh: '工学院南楼 523B，南方科技大学，深圳',
  locationEn: 'Room 523B, Engineering Building South, SUSTech, Shenzhen',
};

export const copy = {
  zh: {
    siteDescription: '计算语言学与意识科学实验室官方网站，研究语言模型、自然语言处理、认知与意识。',
    nav: {
      home: '首页',
      research: '研究与发表',
      news: '消息',
      members: '成员',
      join: '加入 / 联系',
    },
    heroKicker: '南方科技大学 · 计算机科学与工程系 · 深圳',
    heroTitle: '计算语言学与意识科学\n实验室',
    heroSubtitle: lab.nameEn,
    heroIntro: '- 我们研究不同时间尺度与动态环境中，人类语言的使用、理解、学习和演化，并以计算方法探索语言、智能与意识之间的深层联系。\n - 欢迎有志于从事人工智能、计算语言学、心理语言学、认知科学等领域研究的同学加入。\n',
    exploreResearch: '探索研究方向',
    joinUs: '加入我们',
    researchTitle: '研究方向',
    researchMore: '了解更多与查看发表',
    latestNews: '近期消息',
    allNews: '查看全部消息',
    contactTitle: '联系与加入',
    contactIntro: '欢迎对计算语言学、大语言模型与认知科学抱有长期兴趣的学生加入我们。',
    resourcesTitle: '我们提供的计算资源',
    resourcesIntro: '为长期、可复现的研究提供共享基础设施，具体配置可按实际信息替换。',
    readMore: '阅读全文',
    footerNote: '以语言为入口，理解智能与意识。',
  },
  en: {
    siteDescription: 'Official website of the Computational Linguistics & Consciousness Sciences Lab, working on language models, NLP, cognition, and consciousness.',
    nav: {
      home: 'Home',
      research: 'Research & Publications',
      news: 'News',
      members: 'Members',
      join: 'Join / Contact',
    },
    heroKicker: 'SUSTech · Department of CSE · Shenzhen',
    heroTitle: lab.nameEn,
    heroSubtitle: lab.nameZh,
    heroIntro: 'We study how human language is used, understood, learned, and evolved across time scales and dynamic environments, using computational methods to explore the deep connections among language, intelligence, and consciousness.\n\nWe are actively recruiting self-motivated graduate, undergraduate students, and post-docs. ',
    exploreResearch: 'Explore our research',
    joinUs: 'Join us',
    researchTitle: 'Research Areas',
    researchMore: 'Learn more & view publications',
    latestNews: 'Latest News',
    allNews: 'View all news',
    contactTitle: 'Contact & Join Us',
    contactIntro: 'We welcome students with a sustained interest in computational linguistics, large language models, and cognitive science.',
    resourcesTitle: 'Computing Resources',
    resourcesIntro: 'Shared infrastructure for long-term and reproducible research. Replace these placeholders with your actual specifications.',
    readMore: 'Read more',
    footerNote: 'Language as a path toward understanding intelligence and consciousness.',
  },
} satisfies Record<Lang, unknown>;

export const categoryLabels = {
  zh: {
    publication: '论文发表',
    congrats: '成员喜讯',
    event: '学术活动',
    'lab-life': '实验室生活',
    award: '荣誉奖项',
  },
  en: {
    publication: 'Publication',
    congrats: 'Congrats',
    event: 'Event',
    'lab-life': 'Lab Life',
    award: 'Award',
  },
};

export const groupLabels = {
  zh: {
    pi: '负责人',
    postdoc: '博士后',
    phd: '博士生',
    master: '硕士生',
    undergraduate: '本科生',
    alumni: '毕业成员',
  },
  en: {
    pi: 'Principal Investigator',
    postdoc: 'Postdoctoral Fellows',
    phd: 'Ph.D. Students',
    master: "Master's Students",
    undergraduate: 'Undergraduate Students',
    alumni: 'Alumni',
  },
};

export const memberRoleLabels = {
  zh: {
    pi: '实验室负责人 (Principal Investigator)',
    postdoc: '博士后',
    phd: '博士研究生',
    master: '硕士研究生',
    undergraduate: '本科生',
    alumni: '毕业成员',
  },
  en: {
    pi: 'Principal Investigator',
    postdoc: 'Postdoctoral Fellow',
    phd: 'Ph.D. Student',
    master: "Master's Student",
    undergraduate: 'Undergraduate Student',
    alumni: 'Alumni',
  },
};
