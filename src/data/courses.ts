import type { Lang } from '@/lib/paths';

export interface CourseResource {
  label: Record<Lang, string>;
  path: string;
  kind: 'slide' | 'reading' | 'note';
}

export interface CourseWeek {
  week: number;
  topic: Record<Lang, string>;
  dates?: Record<Lang, string>;
  resources?: CourseResource[];
  labPath?: string;
  note?: Record<Lang, string>;
}

const slide = (file: string): CourseResource => ({
  label: { zh: '讲义 PDF', en: 'Slides PDF' },
  path: `course/cse5026/2025/slides/${file}`,
  kind: 'slide',
});

const reading = (file: string, label: string): CourseResource => ({
  label: { zh: label, en: label },
  path: `course/cse5026/2025/readings/${file}`,
  kind: 'reading',
});

const lab = (week: number) => `course/cse5026/2025/labs/week${week}-lab.zip`;

export const cse5026Years = ['2026', '2025'] as const;
export type Cse5026Year = (typeof cse5026Years)[number];

export const cse5026ReadingFiles = [
  '2022.Brains-and-algorithms-NLP.pdf',
  '2025.A Survey on fMRI-based Brain Decoding for Reconstructing Multimodal Stimuli.pdf',
  'A-Mem_agent_memory_2025.pdf',
  'ANN-Primer_2020.pdf',
  'Baddeley_Hitch_1974_Working-Memory.pdf',
  'Brain-word_Indefrey_Levelt_2004.pdf',
  'Chen2005_topological-perceptual.pdf',
  'Controlling Robots Using EEG Signals, Since 1988.pdf',
  'Cowan.2001.the-magical-number-4-in-short-term-memory.pdf',
  'DJField_1987_relations-images-response.pdf',
  'De Neys.2006.Dual processing in reasoning - two systems but one reasoner.pdf',
  'DeLLMa_LLM_DM_2025.pdf',
  'DeepRetina_nips2016.pdf',
  'ERP_CORE_paper.pdf',
  'EmergentTTS-Eval_2025.pdf',
  "HM's brain reconstructed.2013.ncomms4122.pdf",
  'Hermans-Kempen-Van-Loon-1992-Dialogical-Self-American-Psychologist.pdf',
  'Hinton.2006.Deep Belief Nets.pdf',
  'Indefrey-Levelt.2004.Spatial_temporal_word_prod.pdf',
  'Just_Science-1996_brain-activation.pdf',
  'Kopp1996_N200-flanker.pdf',
  'Kutas.1980.Reading_Senseless_Sentences_N400.pdf',
  'LLM_political_DM_2025.pdf',
  'LLMs-emotional-intelligence-tests_2025.pdf',
  'Li.2002.saliency-map.pdf',
  'MIT_2025_Your-Brain-On-ChatGPT.pdf',
  'MPI.2024.A tutorial on open-source large language models for behavioral science.pdf',
  'Maass97_networks-of-spiking-neurons.pdf',
  'Miller_1956_Magical.pdf',
  'Murre.2013.A mathematical model of forgetting and amnesia.pdf',
  'Nelken_Chechik.2007.Information-theory-in-auditory-research.pdf',
  'Replication-forgetting-curve_2015.pdf',
  'Schacter87_implicit-memory.pdf',
  'StefanLFrank.2015.ERP_response_to_surprisal.pdf',
  'Thermodynamics-of-Mind_2024.pdf',
  'Tversky-JudgmentUncertaintyHeuristics-1974.pdf',
  'VLM-perceptual-constancy_2025.pdf',
  'What Learning Systems do  Intelligent Agents Need_KumaranHassabisMcC16CLSUpdate.pdf',
  'Yamins-DiCarlo.nn.2016.pdf',
  'children_llm_learning_2023.pdf',
  'hopfield-1982-neural-networks.pdf',
  'kosinski-2024-evaluating-large-language-models-in-theory-of-mind-tasks.pdf',
  'levy-jaeger-2007.pdf',
  'logic_of_feeling_2004.pdf',
  'rl-primer.pdf',
  'surprise_uid_2024.pdf',
] as const;

export const cse5026Schedule: Record<Cse5026Year, CourseWeek[]> = {
  '2026': [
    { week: 1, dates: { zh: '理论 09/08 · 实验 09/09', en: 'Lecture 09/08 · Lab 09/09' }, topic: { zh: '待更新', en: 'To be announced' } },
    { week: 2, dates: { zh: '理论 09/15 · 实验 09/16', en: 'Lecture 09/15 · Lab 09/16' }, topic: { zh: '待更新', en: 'To be announced' } },
    { week: 3, dates: { zh: '理论 09/22 · 实验 09/23', en: 'Lecture 09/22 · Lab 09/23' }, topic: { zh: '待更新', en: 'To be announced' } },
    { week: 4, dates: { zh: '理论 09/29 · 实验 09/30', en: 'Lecture 09/29 · Lab 09/30' }, topic: { zh: '待更新', en: 'To be announced' } },
    {
      week: 5,
      dates: { zh: '理论 10/06（停课）· 实验补课 10/10', en: 'Lecture 10/06 (no class) · Lab make-up 10/10' },
      topic: { zh: '国庆假期', en: 'National Day holiday' },
      note: { zh: '根据校历，10 月 10 日补上单周周三的课。', en: 'The odd-week Wednesday class is made up on October 10.' },
    },
    {
      week: 6,
      dates: { zh: '理论 10/13 · 实验 10/14', en: 'Lecture 10/13 · Lab 10/14' },
      topic: { zh: '上下文无关语法 (Context-Free Grammars, CFG) 与句法分析', en: 'Context-Free Grammars and Parsing' },
      resources: [{
        label: { zh: '讲义 PPTX', en: 'Slides PPTX' },
        path: 'course/cse5026/2026/slides/0x-cfg_parsing.pptx',
        kind: 'slide',
      }],
    },
    { week: 7, dates: { zh: '理论 10/20 · 实验 10/21', en: 'Lecture 10/20 · Lab 10/21' }, topic: { zh: '待更新', en: 'To be announced' } },
    {
      week: 8,
      dates: { zh: '理论 10/27 · 实验 10/28', en: 'Lecture 10/27 · Lab 10/28' },
      topic: { zh: '待更新', en: 'To be announced' },
    },
    {
      week: 9,
      dates: { zh: '理论 11/03 · 实验 11/04', en: 'Lecture 11/03 · Lab 11/04' },
      topic: { zh: '待更新', en: 'To be announced' },
    },
    { week: 10, dates: { zh: '理论 11/10 · 实验 11/11', en: 'Lecture 11/10 · Lab 11/11' }, topic: { zh: '待更新', en: 'To be announced' } },
    { week: 11, dates: { zh: '理论 11/17 · 实验 11/18', en: 'Lecture 11/17 · Lab 11/18' }, topic: { zh: '待更新', en: 'To be announced' } },
    { week: 12, dates: { zh: '理论 11/24 · 实验 11/25', en: 'Lecture 11/24 · Lab 11/25' }, topic: { zh: '待更新', en: 'To be announced' } },
    { week: 13, dates: { zh: '理论 12/01 · 实验 12/02', en: 'Lecture 12/01 · Lab 12/02' }, topic: { zh: '待更新', en: 'To be announced' } },
    { week: 14, dates: { zh: '理论 12/08 · 实验 12/09', en: 'Lecture 12/08 · Lab 12/09' }, topic: { zh: '待更新', en: 'To be announced' } },
    { week: 15, dates: { zh: '理论 12/15 · 实验 12/16', en: 'Lecture 12/15 · Lab 12/16' }, topic: { zh: '待更新', en: 'To be announced' } },
    { week: 16, dates: { zh: '理论 12/22 · 实验 12/23', en: 'Lecture 12/22 · Lab 12/23' }, topic: { zh: '待更新', en: 'To be announced' } },
    {
      week: 17,
      dates: { zh: '12/29–12/30', en: '12/29–12/30' },
      topic: { zh: '期末考试周', en: 'Final examination period' },
      note: { zh: '期末考试时间待定。', en: 'Final examination time to be confirmed.' },
    },
  ],
  '2025': [
    {
      week: 1,
      topic: { zh: '绪论：认知科学的兴起、方法与人工智能', en: 'Introduction: cognitive science, methods, and AI' },
      resources: [slide('00-intro.pdf')],
      labPath: lab(1),
    },
    {
      week: 2,
      topic: { zh: '认知的神经基础', en: 'Neural foundations of cognition' },
      resources: [
        slide('01-neural.pdf'),
        reading('ANN-Primer_2020.pdf', 'ANN Primer'),
        reading('hopfield-1982-neural-networks.pdf', 'Hopfield (1982)'),
      ],
      labPath: lab(2),
    },
    {
      week: 3,
      topic: { zh: '感知、视觉与注意', en: 'Perception, vision, and attention' },
      resources: [
        slide('02-perception_attention.pdf'),
        reading('Kopp1996_N200-flanker.pdf', 'Kopp et al. (1996)'),
        reading('ERP_CORE_paper.pdf', 'ERP CORE'),
      ],
      labPath: lab(3),
    },
    {
      week: 4,
      topic: { zh: '视觉与物体识别', en: 'Vision and object recognition' },
      resources: [
        slide('03-vision.pdf'),
        reading('DeepRetina_nips2016.pdf', 'DeepRetina'),
        reading('Yamins-DiCarlo.nn.2016.pdf', 'Yamins & DiCarlo (2016)'),
      ],
      labPath: lab(4),
    },
    {
      week: 5,
      topic: { zh: '国庆假期', en: 'National Day holiday' },
      note: { zh: '本周停课。', en: 'No class.' },
    },
    {
      week: 6,
      topic: { zh: '类脑计算', en: 'Neuromorphic computing' },
      resources: [
        slide('04-neuromorphic_computing.pdf'),
        reading('Maass97_networks-of-spiking-neurons.pdf', 'Maass (1997)'),
      ],
      labPath: lab(6),
    },
    {
      week: 7,
      topic: { zh: '听觉与语音识别', en: 'Audition and speech recognition' },
      resources: [
        slide('05-auditory_speech.pdf'),
        reading('Nelken_Chechik.2007.Information-theory-in-auditory-research.pdf', 'Nelken & Chechik (2007)'),
        reading('EmergentTTS-Eval_2025.pdf', 'EmergentTTS-Eval (2025)'),
      ],
      labPath: lab(7),
    },
    {
      week: 8,
      topic: { zh: '记忆 I：短时记忆与工作记忆', en: 'Memory I: short-term and working memory' },
      resources: [
        slide('06-memory_i.pdf'),
        reading('Miller_1956_Magical.pdf', 'Miller (1956)'),
        reading('Baddeley_Hitch_1974_Working-Memory.pdf', 'Baddeley & Hitch (1974)'),
        reading('Cowan.2001.the-magical-number-4-in-short-term-memory.pdf', 'Cowan (2001)'),
      ],
      labPath: lab(8),
    },
    {
      week: 9,
      topic: { zh: '记忆 II：长时记忆、遗忘与内隐记忆', en: 'Memory II: long-term memory, forgetting, and implicit memory' },
      resources: [
        slide('07-memory_ii.pdf'),
        reading('Schacter87_implicit-memory.pdf', 'Schacter (1987)'),
        reading('Replication-forgetting-curve_2015.pdf', 'Replication of the forgetting curve'),
      ],
      labPath: lab(9),
    },
    {
      week: 10,
      topic: { zh: '语言与语言模型 I', en: 'Language and language models I' },
      resources: [
        slide('08-language_i.pdf'),
        reading('Indefrey-Levelt.2004.Spatial_temporal_word_prod.pdf', 'Indefrey & Levelt (2004)'),
        reading('Kutas.1980.Reading_Senseless_Sentences_N400.pdf', 'Kutas & Hillyard (1980)'),
      ],
      labPath: lab(10),
    },
    {
      week: 11,
      topic: { zh: '语言与认知负载', en: 'Language and cognitive load' },
      resources: [
        slide('09-language_ii.pdf'),
        reading('levy-jaeger-2007.pdf', 'Levy & Jaeger (2007)'),
        reading('StefanLFrank.2015.ERP_response_to_surprisal.pdf', 'Frank et al. (2015)'),
        reading('surprise_uid_2024.pdf', 'Surprisal & UID (2024)'),
      ],
      labPath: lab(11),
    },
    {
      week: 12,
      topic: { zh: '学习理论', en: 'Learning theories' },
      resources: [
        slide('10-learning.pdf'),
        reading('Hinton.2006.Deep Belief Nets.pdf', 'Hinton et al. (2006)'),
        reading('rl-primer.pdf', 'Reinforcement learning primer'),
      ],
      labPath: lab(12),
    },
    {
      week: 13,
      topic: { zh: '思维、推理与决策', en: 'Thinking, reasoning, and decision making' },
      resources: [
        slide('11-thinking_JDM.pdf'),
        reading('Tversky-JudgmentUncertaintyHeuristics-1974.pdf', 'Tversky & Kahneman (1974)'),
        reading('DeLLMa_LLM_DM_2025.pdf', 'DeLLMa (2025)'),
      ],
      labPath: lab(13),
    },
    {
      week: 14,
      topic: { zh: '情绪与情感计算', en: 'Emotion and affective computing' },
      resources: [
        slide('12-emotion.pdf'),
        reading('logic_of_feeling_2004.pdf', 'The Logic of Feeling (2004)'),
        reading('LLMs-emotional-intelligence-tests_2025.pdf', 'LLM emotional intelligence (2025)'),
      ],
      labPath: lab(14),
    },
    {
      week: 15,
      topic: { zh: '意识理论', en: 'Theories of consciousness' },
      resources: [
        slide('13-consciousness.pdf'),
        reading('Thermodynamics-of-Mind_2024.pdf', 'Thermodynamics of Mind (2024)'),
      ],
    },
    {
      week: 16,
      topic: { zh: '复习与总结', en: 'Review and summary' },
      resources: [slide('14-review.pdf')],
    },
  ],
};
