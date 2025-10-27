// countries.ts - dummy content
export interface Country {
  name: string;
  nameAr: string;
  code: string;
  dialCode: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  {
    name: 'Lebanon',
    nameAr: 'لبنان',
    code: 'LB',
    dialCode: '+961',
    flag: '🇱🇧'
  },
  {
    name: 'Saudi Arabia',
    nameAr: 'المملكة العربية السعودية',
    code: 'SA',
    dialCode: '+966',
    flag: '🇸🇦'
  },
  {
    name: 'Qatar',
    nameAr: 'قطر',
    code: 'QA',
    dialCode: '+974',
    flag: '🇶🇦'
  },
  {
    name: 'Kuwait',
    nameAr: 'الكويت',
    code: 'KW',
    dialCode: '+965',
    flag: '🇰🇼'
  },
  {
    name: 'Oman',
    nameAr: 'عمان',
    code: 'OM',
    dialCode: '+968',
    flag: '🇴🇲'
  },
  {
    name: 'Jordan',
    nameAr: 'الأردن',
    code: 'JO',
    dialCode: '+962',
    flag: '🇯🇴'
  },
  {
    name: 'Egypt',
    nameAr: 'مصر',
    code: 'EG',
    dialCode: '+20',
    flag: '🇪🇬'
  },
  {
    name: 'United Arab Emirates',
    nameAr: 'الإمارات العربية المتحدة',
    code: 'AE',
    dialCode: '+971',
    flag: '🇦🇪'
  },
  {
    name: 'Bahrain',
    nameAr: 'البحرين',
    code: 'BH',
    dialCode: '+973',
    flag: '🇧🇭'
  },
  {
    name: 'Morocco',
    nameAr: 'المغرب',
    code: 'MA',
    dialCode: '+212',
    flag: '🇲🇦'
  },
  {
    name: 'Algeria',
    nameAr: 'الجزائر',
    code: 'DZ',
    dialCode: '+213',
    flag: '🇩🇿'
  },
  {
    name: 'Tunisia',
    nameAr: 'تونس',
    code: 'TN',
    dialCode: '+216',
    flag: '🇹🇳'
  }
];
