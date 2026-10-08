import { DevanagariDetails, SyntheticPerson } from '../types';

/**
 * Maps English numerals 0-9 to Nepali Devanagari numerals ०-९.
 */
export function toNepaliNumerals(input: number | string): string {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return input.toString().replace(/[0-9]/g, (digit) => nepaliDigits[parseInt(digit, 10)]);
}

/**
 * Maps Nepali Devanagari numerals ०-९ to English numerals 0-9.
 */
export function toEnglishNumerals(input: string): string {
  const nepaliToEnglish: Record<string, string> = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  };
  return input.replace(/[०-९]/g, (char) => nepaliToEnglish[char] ?? char);
}

/**
 * 7 Provinces in Devanagari
 */
export const PROVINCES_DEVANAGARI: Record<string, string> = {
  'Koshi Province': 'कोशी प्रदेश',
  'Madhesh Province': 'मधेश प्रदेश',
  'Bagmati Province': 'बागमती प्रदेश',
  'Gandaki Province': 'गण्डकी प्रदेश',
  'Lumbini Province': 'लुम्बिनी प्रदेश',
  'Karnali Province': 'कर्णाली प्रदेश',
  'Sudurpashchim Province': 'सुदूरपश्चिम प्रदेश',
};

/**
 * All 77 Districts in Devanagari
 */
export const DISTRICTS_DEVANAGARI: Record<string, string> = {
  // Koshi
  Bhojpur: 'भोजपुर',
  Dhankuta: 'धनकुटा',
  Ilam: 'इलाम',
  Jhapa: 'झापा',
  Khotang: 'खोटाङ',
  Morang: 'मोरङ',
  Okhaldhunga: 'ओखलढुङ्गा',
  Panchthar: 'पाँचथर',
  Sankhuwasabha: 'संखुवासभा',
  Solukhumbu: 'सोलुखुम्बु',
  Sunsari: 'सुनसरी',
  Taplejung: 'ताप्लेजुङ',
  Terhathum: 'तेह्रथुम',
  Udayapur: 'उदयपुर',

  // Madhesh
  Saptari: 'सप्तरी',
  Siraha: 'सिराहा',
  Dhanusha: 'धनुषा',
  Mahottari: 'महोत्तरी',
  Sarlahi: 'सर्लाही',
  Rautahat: 'रौतहट',
  Bara: 'बारा',
  Parsa: 'पर्सा',

  // Bagmati
  Bhaktapur: 'भक्तपुर',
  Chitwan: 'चितवन',
  Dhading: 'धादिङ',
  Dolakha: 'दोलखा',
  Kathmandu: 'काठमाडौँ',
  Kavrepalanchok: 'काभ्रेपलाञ्चोक',
  Lalitpur: 'ललितपुर',
  Makwanpur: 'मकवानपुर',
  Nuwakot: 'नुवाकोट',
  Ramechhap: 'रामेछाप',
  Rasuwa: 'रसुवा',
  Sindhuli: 'सिन्धुली',
  Sindhupalchok: 'सिन्धुपाल्चोक',

  // Gandaki
  Baglung: 'बागलुङ',
  Gorkha: 'गोरखा',
  Kaski: 'कास्की',
  Lamjung: 'लमजुङ',
  Manang: 'मनाङ',
  Mustang: 'मुस्ताङ',
  Myagdi: 'म्याग्दी',
  Nawalpur: 'नवलपरासी (बर्दघाट सुस्ता पूर्व)',
  'Nawalparasi East': 'नवलपरासी (बर्दघाट सुस्ता पूर्व)',
  Parbat: 'पर्वत',
  Syangja: 'स्याङ्जा',
  Tanahun: 'तनहुँ',

  // Lumbini
  Kapilvastu: 'कपिलवस्तु',
  Parasi: 'नवलपरासी (बर्दघाट सुस्ता पश्चिम)',
  'Nawalparasi West': 'नवलपरासी (बर्दघाट सुस्ता पश्चिम)',
  Rupandehi: 'रुपन्देही',
  Arghakhanchi: 'अर्घाखाँची',
  Gulmi: 'गुल्मी',
  Palpa: 'पाल्पा',
  Dang: 'दाङ',
  Pyuthan: 'प्युठान',
  Rolpa: 'रोल्पा',
  'Eastern Rukum': 'पूर्वी रुकुम',
  'Rukum East': 'पूर्वी रुकुम',
  Banke: 'बाँके',
  Bardiya: 'बर्दिया',

  // Karnali
  'Western Rukum': 'पश्चिम रुकुम',
  'Rukum West': 'पश्चिम रुकुम',
  Salyan: 'सल्यान',
  Dolpa: 'डोल्पा',
  Humla: 'हुम्ला',
  Jumla: 'जुम्ला',
  Kalikot: 'कालिकोट',
  Mugu: 'मुगु',
  Surkhet: 'सुर्खेत',
  Dailekh: 'दैलेख',
  Jajarkot: 'जाजरकोट',

  // Sudurpashchim
  Kailali: 'कैलाली',
  Achham: 'अछाम',
  Doti: 'डोटी',
  Bajhang: 'बझाङ',
  Bajura: 'बाजुरा',
  Kanchanpur: 'कञ्चनपुर',
  Dadeldhura: 'डडेलधुरा',
  Baitadi: 'बैतडी',
  Darchula: 'दार्चुला',
};

/**
 * Common authentic Nepali First Names dictionary in Devanagari
 */
export const FIRST_NAMES_DEVANAGARI: Record<string, string> = {
  // Male
  Aadarsh: 'आदर्श',
  Aaditya: 'आदित्य',
  Aakarshan: 'आकर्षण',
  Aanand: 'आनन्द',
  Aarav: 'आरव',
  Aashish: 'आशिष',
  Aayush: 'आयुष',
  Abhishek: 'अभिषेक',
  Ajay: 'अजय',
  Ajit: 'अजित',
  Alok: 'आलोक',
  Aman: 'अमन',
  Amar: 'अमर',
  Amit: 'अमित',
  Amrit: 'अमृत',
  Anand: 'आनन्द',
  Anil: 'अनिल',
  Anish: 'अनिश',
  Ankit: 'अंकित',
  Anmol: 'अनमोल',
  Anuj: 'अनुज',
  Anup: 'अनुप',
  Ashok: 'अशोक',
  Avinash: 'अविनाश',
  Badri: 'बद्री',
  Balaram: 'बलराम',
  Basanta: 'वसन्त',
  Bharat: 'भरत',
  Bibek: 'विवेक',
  Bikash: 'विकास',
  Bikram: 'विक्रम',
  Bimal: 'विमल',
  Binod: 'विनोद',
  Bipin: 'विपिन',
  Birendra: 'वीरेन्द्र',
  Bishal: 'विशाल',
  Bishnu: 'विष्णु',
  Chandan: 'चन्दन',
  Deepak: 'दीपक',
  Deependra: 'दिपेन्द्र',
  Dev: 'देव',
  Dinesh: 'दिनेश',
  Dipak: 'दिपक',
  Dipen: 'दिपेन',
  Dipendra: 'दिपेन्द्र',
  Dipesh: 'दिपेश',
  Ganesh: 'गणेश',
  Gaurav: 'गौरव',
  Gautam: 'गौतम',
  Gopal: 'गोपाल',
  Govinda: 'गोविन्द',
  Hari: 'हरि',
  Harish: 'हरीश',
  Hem: 'हेम',
  Himal: 'हिमाल',
  Ishwar: 'ईश्वर',
  Janak: 'जनक',
  Jeevan: 'जीवन',
  Kailash: 'कैलाश',
  Kamal: 'कमल',
  Kapil: 'कपिल',
  Karan: 'करण',
  Keshav: 'केशव',
  Kiran: 'किरण',
  Kishor: 'किशोर',
  Krishna: 'कृष्ण',
  Kushal: 'कुशल',
  Laxman: 'लक्ष्मण',
  Madhav: 'माधव',
  Mahendra: 'महेन्द्र',
  Mahesh: 'महेश',
  Manoj: 'मनोज',
  Manish: 'मनिष',
  Milan: 'मिलन',
  Mohan: 'मोहन',
  Mukesh: 'मुकेश',
  Nabin: 'नविन',
  Narayan: 'नारायण',
  Narendra: 'नरेन्द्र',
  Naresh: 'नरेश',
  Niraj: 'निरज',
  Nirmal: 'निर्मल',
  Nischal: 'निश्चल',
  Pawan: 'पवन',
  Prabhat: 'प्रभात',
  Pradeep: 'प्रदीप',
  Prakash: 'प्रकाश',
  Pramod: 'प्रमोद',
  Prashant: 'प्रशान्त',
  Prem: 'प्रेम',
  Rabindra: 'रबिन्द्र',
  Raj: 'राज',
  Rajan: 'राजन',
  Rajendra: 'राजेन्द्र',
  Rajesh: 'राजेश',
  Raju: 'राजु',
  Rakesh: 'राकेश',
  Ram: 'राम',
  Ramesh: 'रमेश',
  Rohit: 'रोहित',
  Roshan: 'रोशन',
  Sagar: 'सागर',
  Sandeep: 'सन्दीप',
  Sanjay: 'सञ्जय',
  Santosh: 'सन्तोष',
  Saroj: 'सरोज',
  Saurav: 'सौरव',
  Shambhu: 'शम्भु',
  Shiva: 'शिव',
  Subash: 'सुवास',
  Sudip: 'सुदीप',
  Sujan: 'सुजन',
  Suman: 'सुमन',
  Sunil: 'सुनिल',
  Suraj: 'सुरज',
  Suresh: 'सुरेश',
  Sushant: 'सुशान्त',
  Sushil: 'सुशिल',
  Umesh: 'उमेश',
  Ujjwal: 'उज्ज्वल',

  // Female
  Aakriti: 'आकृति',
  Aarati: 'आरती',
  Aasha: 'आशा',
  Anita: 'अनिता',
  Anju: 'अन्जु',
  Archana: 'अर्चना',
  Asmita: 'अस्मिता',
  Bandana: 'बन्दना',
  Barsha: 'बर्षा',
  Bhabana: 'भावना',
  Bina: 'बिना',
  Binita: 'विनिता',
  Bipana: 'बिपना',
  Chandani: 'चाँदनी',
  Deepa: 'दीपा',
  Dikshya: 'दिक्षा',
  Geeta: 'गीता',
  Goma: 'गोमा',
  Indira: 'इन्दिरा',
  Ishwori: 'ईश्वरी',
  Jamuna: 'जमुना',
  Kabita: 'कविता',
  Kalpana: 'कल्पना',
  Kamala: 'कमला',
  Karuna: 'करुणा',
  Kopila: 'कोपिला',
  Kriti: 'कृति',
  Laxmi: 'लक्ष्मी',
  Madhu: 'मधु',
  Manisha: 'मनिषा',
  Maya: 'माया',
  Menuka: 'मेनुका',
  Mina: 'मिना',
  Nabina: 'नविना',
  Namrata: 'नम्रता',
  Nisha: 'निशा',
  Pabitra: 'पवित्रा',
  Parbati: 'पार्वती',
  Pooja: 'पूजा',
  Pragya: 'प्रज्ञा',
  Pramila: 'प्रमिला',
  Pratima: 'प्रतिमा',
  Preeti: 'प्रीति',
  Radhika: 'राधिका',
  Rajani: 'रजनी',
  Ranjita: 'रञ्जिता',
  Rekha: 'रेखा',
  Renu: 'रेणु',
  Ritu: 'रितु',
  Sabina: 'सबिना',
  Sabita: 'सबिता',
  Sadhana: 'साधना',
  Samikshya: 'समिक्षा',
  Sangita: 'सङ्गीता',
  Sanju: 'सञ्जु',
  Sapana: 'सपना',
  Saraswati: 'सरस्वती',
  Sarita: 'सरिता',
  Shanti: 'शान्ति',
  Sharmila: 'शर्मिला',
  Shova: 'शोभा',
  Sita: 'सीता',
  Smriti: 'स्मृति',
  Sneha: 'स्नेहा',
  Srijana: 'सृजना',
  Sujata: 'सुजाता',
  Sunita: 'सुनिता',
  Sushila: 'सुशीला',
  Sushma: 'सुषमा',
  Sweta: 'श्वेता',
  Tara: 'तारा',
  Uma: 'उमा',
  Urmila: 'उर्मिला',
  Ushma: 'उष्मा',
  Simran: 'सिमरन',
  Alina: 'एलिना',
  Alisha: 'अलिसा',
  Ambika: 'अम्बिका',
  Amrita: 'अमृता',
  Anamika: 'अनामिका',
  Anjali: 'अञ्जली',
  Anjana: 'अञ्जना',
  Anushka: 'अनुष्का',
  Apsara: 'अप्सरा',
  Aruna: 'अरुणा',
  Bimala: 'विमला',
  Deepika: 'दीपिका',
  Durga: 'दुर्गा',
  Ganga: 'गंगा',
  Garima: 'गरिमा',
  Gita: 'गीता',
  Jyoti: 'ज्योति',
  Kanchan: 'कञ्चन',
  Karishma: 'करिश्मा',
  Kripa: 'कृपा',
  Kumari: 'कुमारी',
  Kusum: 'कुसुम',
  Mamata: 'ममता',
  Poonam: 'पूनम',
  Prakriti: 'प्रकृति',
  Pratibha: 'प्रतिभा',
  Pratikshya: 'प्रतिक्षा',
  Priya: 'प्रिया',
  Priyanka: 'प्रियंका',
  Puja: 'पूजा',
  Purnima: 'पूर्णिमा',
  Pushpa: 'पुष्पा',
  Rachana: 'रचना',
  Radha: 'राधा',
  Rashmi: 'रश्मि',
  Reecha: 'ऋचा',
  Richa: 'ऋचा',
  Rojina: 'रोजिना',
  Rupa: 'रूपा',
  Sandhya: 'सन्ध्या',
  Sharada: 'शारदा',
  Shreya: 'श्रेया',
  Shristi: 'सृष्टि',
  Srishti: 'सृष्टि',
  Sudha: 'सुधा',
  Usha: 'उषा',
};

/**
 * Common authentic Nepali Surnames dictionary in Devanagari
 */
export const SURNAMES_DEVANAGARI: Record<string, string> = {
  Acharya: 'आचार्य',
  Adhikari: 'अधिकारी',
  Aryal: 'अर्याल',
  Bajracharya: 'बज्राचार्य',
  Baral: 'बराल',
  Basnet: 'बस्नेत',
  Bastola: 'बास्तोला',
  Bhandari: 'भण्डारी',
  Bhatta: 'भट्ट',
  Bhattarai: 'भट्टराई',
  Bhusal: 'भुसाल',
  Bista: 'विष्ट',
  Bohara: 'बोहरा',
  Budhathoki: 'बुढाथोकी',
  Chaudhary: 'चौधरी',
  Chhetri: 'क्षेत्री',
  Dahal: 'दाहाल',
  Dangol: 'डंगोल',
  Devkota: 'देवकोटा',
  Dhakal: 'ढकाल',
  Gautam: 'गौतम',
  Ghimire: 'घिमिरे',
  Giri: 'गिरी',
  Gurung: 'गुरुङ',
  Gyawali: 'ज्ञवाली',
  Humagain: 'हुमागाईं',
  Jha: 'झा',
  Joshi: 'जोशी',
  Kafle: 'काफ्ले',
  Karki: 'कार्की',
  Katuwal: 'कटुवाल',
  KC: 'केसी',
  Khadka: 'खड्का',
  Khanal: 'खनाल',
  Khatiwada: 'खतिवडा',
  Koirala: 'कोइराला',
  Lamichhane: 'लामिछाने',
  Limbu: 'लिम्बु',
  Magar: 'मगर',
  Maharjan: 'महर्जन',
  Mahato: 'महतो',
  Mainali: 'मैनाली',
  Mandal: 'मण्डल',
  Marasini: 'मरासिनी',
  Mishra: 'मिश्र',
  Neupane: 'न्यौपाने',
  Oli: 'ओली',
  Pandey: 'पाण्डे',
  Pandit: 'पण्डित',
  Pant: 'पन्त',
  Parajuli: 'पराजुली',
  Paudel: 'पौडेल',
  Pokharel: 'पोखरेल',
  Pradhan: 'प्रधान',
  Prasai: 'प्रसाईं',
  Pun: 'पुन',
  Puri: 'पुरी',
  Pyakurel: 'प्याकुरेल',
  Rai: 'राई',
  Rajbanshi: 'राजवंशी',
  Regmi: 'रेग्मी',
  Rijal: 'रिजाल',
  Rimal: 'रिमाल',
  Rokaya: 'रोकाया',
  Sah: 'साह',
  Sapkota: 'सापकोटा',
  Shah: 'शाह',
  Shahi: 'शाही',
  Shakya: 'शाक्य',
  Sharma: 'शर्मा',
  Shrestha: 'श्रेष्ठ',
  Silwal: 'सिलवाल',
  Subedi: 'सुवेदी',
  Tamang: 'तामाङ',
  Thapa: 'थापा',
  Tiwari: 'तिवारी',
  Tripathi: 'त्रिपाठी',
  Upreti: 'उप्रेती',
  Wagle: 'वाग्ले',
  Yadav: 'यादव',
  Sen: 'सेन',
  Agrawal: 'अग्रवाल',
  Ale: 'आले',
  Ansari: 'अन्सारी',
  Awasthi: 'अवस्थी',
  Badu: 'बडू',
  Baidya: 'वैद्य',
  Baniya: 'बानियाँ',
  Banskota: 'बाँस्कोटा',
  Barma: 'वर्मा',
  Basyal: 'बस्याल',
  Bhat: 'भट्ट',
  Bhujel: 'भुजेल',
  Budha: 'बुढा',
  Byanjankar: 'व्यञ्जनकार',
  Chaulagain: 'चौलागाईं',
  Chemjong: 'चेम्जोङ',
  Chitrakar: 'चित्रकार',
  Daga: 'डागा',
  Danuwar: 'दनुवार',
  Dawadi: 'दवाडी',
  Dhamala: 'धमाला',
  Dhungana: 'ढुङ्गाना',
  Dhungel: 'ढुङ्गेल',
  Dixit: 'दीक्षित',
  Gahatraj: 'गहतराज',
  Gaire: 'गैरे',
  Gajurel: 'गजुरेल',
  Gauchan: 'गौचन',
  Gharti: 'घर्ती',
  Gole: 'गोले',
  Gorkhali: 'गोर्खाली',
  Gubhaju: 'गुभाजु',
  Hamal: 'हमाल',
  Kadel: 'कँडेल',
  Kandel: 'कँडेल',
  Karanjit: 'करणजीत',
  Kattel: 'कट्टेल',
  Kharel: 'खरेल',
  Khatri: 'खत्री',
  Kunwar: 'कुँवर',
  Lama: 'लामा',
  Lohani: 'लोहनी',
  Mahat: 'माहत',
  Malla: 'मल्ल',
  Manandhar: 'मानन्धर',
  Maskey: 'मास्के',
  Moktan: 'मोक्तान',
  Mukhiya: 'मुखिया',
  Mulmi: 'मुल्मी',
  Niraula: 'निरौला',
  Ojha: 'ओझा',
  Pande: 'पाण्डे',
  Panthi: 'पन्थी',
  Pariyar: 'परियार',
  Pathak: 'पाठक',
  Poudel: 'पौडेल',
  Pokhrel: 'पोखरेल',
  Prajapati: 'प्रजापति',
  Pudasaini: 'पुडासैनी',
  Rajbhandari: 'राजभण्डारी',
  Rana: 'राणा',
  Ranabhat: 'रानाभाट',
  Raut: 'राउत',
  Rawal: 'रावल',
  Rawat: 'रावत',
  Roka: 'रोका',
  Sahu: 'साहु',
  Sanba: 'सान्बा',
  Sedhai: 'सेढाईं',
  Sherpa: 'शेर्पा',
  Simkhada: 'सिम्खडा',
  Singh: 'सिंह',
  Siwakoti: 'सिवाकोटी',
  Subba: 'सुब्बा',
  Suwal: 'सुवाल',
  Tamrakar: 'ताम्राकार',
  Tandan: 'टण्डन',
  Thakur: 'ठाकुर',
  Tharu: 'थारु',
  Timalsina: 'तिमल्सिना',
  Timilsina: 'तिमील्सिना',
  Tuladhar: 'तुलाधर',
  Upadhyay: 'उपाध्याय',
  Vaidya: 'वैद्य',
};

/**
 * Common Professions & Occupations in Devanagari
 */
export const OCCUPATIONS_DEVANAGARI: Record<string, string> = {
  'Software Engineer': 'सफ्टवेयर इन्जिनियर',
  'Civil Engineer': 'सिभिल इन्जिनियर',
  'Bank Manager': 'बैंक प्रबन्धक',
  'Chartered Accountant': 'चार्टर्ड एकाउन्टेन्ट',
  'Medical Doctor': 'चिकित्सक / डाक्टर',
  'Staff Nurse': 'स्टाफ नर्स',
  'Teacher': 'शिक्षक',
  'Secondary School Teacher': 'माध्यमिक तह शिक्षक',
  'Senior Lecturer': 'वरिष्ठ प्राध्यापक',
  'Farmer / Agriculturalist': 'कृषक / किसान',
  'Lead Farmer': 'अगुवा कृषक',
  'Student': 'विद्यार्थी',
  'Business Owner / Entrepreneur': 'व्यवसायी / उद्यमी',
  'Managing Director': 'प्रबन्ध निर्देशक',
  'Administrative Officer': 'प्रशासनिक अधिकृत',
  'Branch Officer': 'शाखा अधिकृत',
  'Finance Officer': 'वित्त अधिकृत',
  'Operations Specialist': 'सञ्चालन विशेषज्ञ',
  'Marketing Executive': 'बजार व्यवस्थापक',
  'Human Resources Officer': 'मानव स्रोत अधिकृत',
  'Electrical Engineer': 'विद्युत इन्जिनियर',
  'Pharmacist': 'औषधीविद् / फार्मासिस्ट',
  'Journalist': 'पत्रकार',
  'Tourism Officer': 'पर्यटन अधिकृत',
};

/**
 * Common Departments in Devanagari
 */
export const DEPARTMENTS_DEVANAGARI: Record<string, string> = {
  'Engineering': 'इन्जिनियरिङ शाखा',
  'Information Technology': 'सूचना प्रविधि शाखा',
  'Finance & Accounts': 'लेखा तथा वित्त शाखा',
  'Operations': 'सञ्चालन शाखा',
  'Administration': 'प्रशासन शाखा',
  'Marketing & Sales': 'बजार तथा बिक्री शाखा',
  'Human Resources': 'मानव स्रोत शाखा',
  'Customer Support': 'ग्राहक सेवा शाखा',
  'Academic Affairs': 'शैक्षिक शाखा',
  'Agricultural Operations': 'कृषि सञ्चालन शाखा',
  'Executive Management': 'कार्यकारी व्यवस्थापन',
};

/**
 * Transliterates an English local body name into authentic Nepali Devanagari.
 */
export function transliterateMunicipality(name: string): string {
  let devanagariName = name;

  // Well-known Metropolitans & Sub-Metropolitans
  const majorCities: Record<string, string> = {
    'Kathmandu Metropolitan City': 'काठमाडौँ महानगरपालिका',
    'Lalitpur Metropolitan City': 'ललितपुर महानगरपालिका',
    'Pokhara Metropolitan City': 'पोखरा महानगरपालिका',
    'Bharatpur Metropolitan City': 'भरतपुर महानगरपालिका',
    'Biratnagar Metropolitan City': 'विराटनगर महानगरपालिका',
    'Birgunj Metropolitan City': 'वीरगन्ज महानगरपालिका',
    'Janakpur Sub-Metropolitan City': 'जनकपुर उपमहानगरपालिका',
    'Ghorahi Sub-Metropolitan City': 'घोराही उपमहानगरपालिका',
    'Tulsipur Sub-Metropolitan City': 'तुलसीपुर उपमहानगरपालिका',
    'Itahari Sub-Metropolitan City': 'इटहरी उपमहानगरपालिका',
    'Dharan Sub-Metropolitan City': 'धरान उपमहानगरपालिका',
    'Butwal Sub-Metropolitan City': 'बुटवल उपमहानगरपालिका',
    'Hetauda Sub-Metropolitan City': 'हेटौँडा उपमहानगरपालिका',
    'Dhangadhi Sub-Metropolitan City': 'धनगढी उपमहानगरपालिका',
    'Nepalgunj Sub-Metropolitan City': 'नेपालगन्ज उपमहानगरपालिका',
    'Kalaiya Sub-Metropolitan City': 'कलैया उपमहानगरपालिका',
    'Jitpursimara Sub-Metropolitan City': 'जीतपुरसिमरा उपमहानगरपालिका',
  };

  if (majorCities[name]) {
    return majorCities[name];
  }

  // Handle standard suffixes
  if (name.includes('Metropolitan City')) {
    const base = name.replace(' Metropolitan City', '').trim();
    return `${transliterateWord(base)} महानगरपालिका`;
  }
  if (name.includes('Sub-Metropolitan City')) {
    const base = name.replace(' Sub-Metropolitan City', '').trim();
    return `${transliterateWord(base)} उपमहानगरपालिका`;
  }
  if (name.includes('Rural Municipality')) {
    const base = name.replace(' Rural Municipality', '').trim();
    return `${transliterateWord(base)} गाउँपालिका`;
  }
  if (name.includes('Municipality')) {
    const base = name.replace(' Municipality', '').trim();
    return `${transliterateWord(base)} नगरपालिका`;
  }

  return transliterateWord(devanagariName);
}

/**
 * Transliterates a given name, surname, or word to Nepali Devanagari.
 */
export function transliterateWord(word: string): string {
  if (!word) return '';
  const trimmed = word.trim();

  // 1. Direct dictionary matches
  if (FIRST_NAMES_DEVANAGARI[trimmed]) return FIRST_NAMES_DEVANAGARI[trimmed];
  if (SURNAMES_DEVANAGARI[trimmed]) return SURNAMES_DEVANAGARI[trimmed];
  if (DISTRICTS_DEVANAGARI[trimmed]) return DISTRICTS_DEVANAGARI[trimmed];
  if (PROVINCES_DEVANAGARI[trimmed]) return PROVINCES_DEVANAGARI[trimmed];

  // 2. Phonetic mapper for common Nepali tole and place names
  const placeDictionary: Record<string, string> = {
    Newroad: 'न्युरोड',
    Putalisadak: 'पुतलीसडक',
    Koteshwor: 'कोटेश्वर',
    Baneshwor: 'बानेश्वर',
    Thamel: 'ठमेल',
    Patan: 'पाटन',
    Kumaripati: 'कुमारीपाटी',
    Jawalakhel: 'जावलाखेल',
    Kupondole: 'कुपण्डोल',
    Pulchowk: 'पुल्चोक',
    Balkumari: 'बालकुमारी',
    Lakeside: 'लेकसाइड',
    Chipledhunga: 'चिप्लेढुङ्गा',
    Mahendrapool: 'महेन्द्रपुल',
    PrithviChowk: 'पृथ्वीचोक',
    Biratnagar: 'विराटनगर',
    TrafficChowk: 'ट्राफिकचोक',
    MainRoad: 'मेनरोड',
    Milanchowk: 'मिलनचोक',
    Golpark: 'गोलपार्क',
    Chaubiskothi: 'चौबिसकोठी',
    Narayangarh: 'नारायणगढ',
    Surkhet: 'सुर्खेत',
    Dhangadhi: 'धनगढी',
    Bhanuchowk: 'भानुचोक',
    Tribhuvan: 'त्रिभुवन',
    Sagarmatha: 'सगरमाथा',
    Danphe: 'डाँफे',
    Himalayan: 'हिमालयन',
  };

  if (placeDictionary[trimmed]) return placeDictionary[trimmed];

  // 3. Fallback: simple character substitution rule
  return trimmed;
}

/**
 * Builds full DevanagariDetails for a synthetic person.
 */
export function generateDevanagariDetails(person: SyntheticPerson): DevanagariDetails {
  const nepFirstName = FIRST_NAMES_DEVANAGARI[person.firstName] || transliterateWord(person.firstName);
  const nepLastName = SURNAMES_DEVANAGARI[person.lastName] || transliterateWord(person.lastName);
  const nepMiddleName = person.middleName ? (FIRST_NAMES_DEVANAGARI[person.middleName] || transliterateWord(person.middleName)) : undefined;

  const nepFullName = nepMiddleName
    ? `${nepFirstName} ${nepMiddleName} ${nepLastName}`
    : `${nepFirstName} ${nepLastName}`;

  const nepGender = person.gender === 'Male' ? 'पुरुष' : person.gender === 'Female' ? 'महिला' : 'अन्य';
  const nepHonorific = person.gender === 'Male' ? 'श्री' : person.age > 28 ? 'श्रीमती' : 'सुश्री';

  const nepProvince = PROVINCES_DEVANAGARI[person.address.province] || person.address.province;
  const nepDistrict = DISTRICTS_DEVANAGARI[person.address.district] || person.address.district;
  const nepMunicipality = transliterateMunicipality(person.address.municipality);
  const nepWardNum = toNepaliNumerals(person.address.ward);
  const nepWard = `वडा नं. ${nepWardNum}`;
  const nepTole = transliterateWord(person.address.tole);
  const nepFullAddress = `${nepTole}, ${nepWard}, ${nepMunicipality}, ${nepDistrict}, ${nepProvince}`;

  // Temporary / Current Address Devanagari
  const tempAddr = person.temporaryAddress || person.currentAddress;
  let nepTempProvince: string | undefined;
  let nepTempDistrict: string | undefined;
  let nepTempMunicipality: string | undefined;
  let nepTempWard: string | undefined;
  let nepTempTole: string | undefined;
  let nepTempFullAddress: string | undefined;

  if (tempAddr) {
    nepTempProvince = PROVINCES_DEVANAGARI[tempAddr.province] || tempAddr.province;
    nepTempDistrict = DISTRICTS_DEVANAGARI[tempAddr.district] || tempAddr.district;
    nepTempMunicipality = transliterateMunicipality(tempAddr.municipality);
    const nepTempWardNum = toNepaliNumerals(tempAddr.ward);
    nepTempWard = `वडा नं. ${nepTempWardNum}`;
    nepTempTole = transliterateWord(tempAddr.tole);
    nepTempFullAddress = `${nepTempTole}, ${nepTempWard}, ${nepTempMunicipality}, ${nepTempDistrict}, ${nepTempProvince}`;
  }

  const nepOccupation = OCCUPATIONS_DEVANAGARI[person.occupation] || transliterateWord(person.occupation);
  const nepJobTitle = OCCUPATIONS_DEVANAGARI[person.jobTitle] || nepOccupation;
  const nepDepartment = DEPARTMENTS_DEVANAGARI[person.department] || `${transliterateWord(person.department)} शाखा`;

  // Company Name in Devanagari
  let nepCompany = person.companyName;
  if (nepCompany.includes('Danphe Digital')) nepCompany = 'डाँफे डिजिटल प्रा. लि.';
  else if (nepCompany.includes('Himalayan Cloud')) nepCompany = 'हिमालयन क्लाउड टेक';
  else if (nepCompany.includes('Sagarmatha')) nepCompany = 'सगरमाथा इन्फोसिस प्रा. लि.';
  else if (nepCompany.includes('Kumari Tech')) nepCompany = 'कुमारी टेक इनोभेसन्स';
  else if (nepCompany.includes('Nepal Bank')) nepCompany = 'नेपाल बैंक लिमिटेड';
  else if (nepCompany.includes('University')) nepCompany = 'त्रिभुवन विश्वविद्यालय';

  // Archetype specifics
  let nepSchool: string | undefined;
  let nepGrade: string | undefined;
  let nepFaculty: string | undefined;
  let nepGuardianName: string | undefined;
  let nepCropType: string | undefined;
  let nepCooperative: string | undefined;

  if (person.profileType === 'student') {
    nepSchool = nepCompany;
    nepGrade = person.age >= 21 ? 'स्नातकोत्तर (मास्टर्स)' : person.age >= 18 ? 'स्नातक (ब्याचलर्स)' : 'कक्षा १२';
    nepFaculty = 'विज्ञान तथा प्रविधि संकाय';
    if (person.guardianName) {
      const gParts = person.guardianName.split(' ');
      const gFirst = FIRST_NAMES_DEVANAGARI[gParts[0]] || gParts[0];
      const gLast = SURNAMES_DEVANAGARI[gParts[gParts.length - 1]] || nepLastName;
      nepGuardianName = `${gFirst} ${gLast}`;
    }
  } else if (person.profileType === 'farmer') {
    nepCropType = person.cropType?.includes('Paddy')
      ? 'धान (Paddy)'
      : person.cropType?.includes('Maize')
      ? 'मकै (Maize)'
      : person.cropType?.includes('Tea')
      ? 'अग्र्यानिक चिया (Organic Tea)'
      : 'तरकारी खेती (Vegetables)';
    nepCooperative = `${transliterateWord(person.address.municipality.replace(/ (Rural )?Municipality.*/, ''))} साना किसान कृषि सहकारी संस्था लि.`;
    nepCompany = nepCooperative;
  }

  return {
    honorific: nepHonorific,
    firstName: nepFirstName,
    middleName: nepMiddleName,
    lastName: nepLastName,
    fullName: nepFullName,
    gender: nepGender,
    province: nepProvince,
    district: nepDistrict,
    municipality: nepMunicipality,
    ward: nepWard,
    tole: nepTole,
    fullAddress: nepFullAddress,

    permanentProvince: nepProvince,
    permanentDistrict: nepDistrict,
    permanentMunicipality: nepMunicipality,
    permanentWard: nepWard,
    permanentTole: nepTole,
    permanentFullAddress: nepFullAddress,

    tempProvince: nepTempProvince,
    tempDistrict: nepTempDistrict,
    tempMunicipality: nepTempMunicipality,
    tempWard: nepTempWard,
    tempTole: nepTempTole,
    tempFullAddress: nepTempFullAddress,

    currentProvince: nepTempProvince,
    currentDistrict: nepTempDistrict,
    currentMunicipality: nepTempMunicipality,
    currentWard: nepTempWard,
    currentTole: nepTempTole,
    currentFullAddress: nepTempFullAddress,

    occupation: nepOccupation,
    jobTitle: nepJobTitle,
    department: nepDepartment,
    companyName: nepCompany,
    designation: nepJobTitle,
    businessName: person.businessName ? `${nepLastName} ट्रेडर्स प्रा. लि.` : undefined,
    businessType: person.businessType ? 'प्राइभेट लिमिटेड' : undefined,
    school: nepSchool,
    grade: nepGrade,
    faculty: nepFaculty,
    guardianName: nepGuardianName,
    cropType: nepCropType,
    cooperative: nepCooperative,
    subject: person.subject ? transliterateWord(person.subject) : undefined,
  };
}
