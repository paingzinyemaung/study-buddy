export type Lang = 'en' | 'my';

const en = {
  nav: {
    home: 'Home',
    chat: 'Chat',
    grammar: 'Grammar',
    vocab: 'Vocab',
    quiz: 'Quiz',
  },
  chat: {
    title: 'Chat Practice',
    placeholder: 'Type your English here...',
    send: 'Send',
    error: 'Sorry, something went wrong. Please try again.',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
  },
};

export type Dict = typeof en;

const my: Dict = {
  nav: {
    home: 'ပင်မ',
    chat: 'စကားပြော',
    grammar: 'သဒ္ဒါ',
    vocab: 'ဝေါဟာရ',
    quiz: 'မေးခွန်း',
  },
  chat: {
    title: 'စကားပြောလေ့ကျင့်ရန်',
    placeholder: 'အင်္ဂလိပ်လို ဒီမှာရိုက်ပါ...',
    send: 'ပို့မည်',
    error: 'တောင်းပန်ပါတယ်၊ တစ်ခုခုမှားသွားပါတယ်။ ပြန်ကြိုးစားကြည့်ပါ။',
    beginner: 'အစပိုင်း',
    intermediate: 'အလယ်အလတ်',
  },
};

export const translations: Record<Lang, Dict> = { en, my };
