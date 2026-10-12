import { DevanagariDetails, NepalAddress, SyntheticPerson } from '../types';
import { findCommercialBank, translateBankBranch } from './bankingDetails';
import {
  MunicipalityType,
  NepalDataEngine,
  inferMunicipalityType,
  stripMunicipalitySuffix,
} from './nepalDataEngine';
import { BLOOD_GROUPS_DEVANAGARI } from './bloodGroup';
import { toNepaliNumerals } from './numerals';

export { toNepaliNumerals, toEnglishNumerals } from './numerals';

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

  // Male (extended)
  Abhiyan: 'अभियान',
  Achal: 'अचल',
  Achintya: 'अचिन्त्य',
  Amir: 'अमिर',
  Ashwin: 'अश्विन',
  Bhaskar: 'भास्कर',
  Bheshraj: 'भेषराज',
  Bidhata: 'विधाता',
  Bidur: 'विदुर',
  Binit: 'विनित',
  Birodh: 'विरोध',
  Biru: 'बिरु',
  Bishwa: 'विश्व',
  Chetan: 'चेतन',
  Chhabi: 'छवि',
  Damodar: 'दामोदर',
  Darshan: 'दर्शन',
  Dayaram: 'दयाराम',
  Devendra: 'देवेन्द्र',
  Devraj: 'देवराज',
  Dhanraj: 'धनराज',
  Dharmendra: 'धर्मेन्द्र',
  Dhiraj: 'धिरज',
  Dipta: 'दीप्त',
  Ghanashyam: 'घनश्याम',
  Giri: 'गिरि',
  Giriraj: 'गिरिराज',
  Hemanta: 'हेमन्त',
  Hemraj: 'हेमराज',
  Hira: 'हीरा',
  Hriday: 'हृदय',
  Indra: 'इन्द्र',
  Jagadish: 'जगदीश',
  Jitendra: 'जितेन्द्र',
  Kalyan: 'कल्याण',
  Kedar: 'केदार',
  Kuldeep: 'कुलदीप',
  Lokendra: 'लोकेन्द्र',
  Midan: 'मिदन',
  Mukunda: 'मुकुन्द',
  Nanda: 'नन्द',
  Navaraj: 'नवराज',
  Neeraj: 'नीरज',
  Niroj: 'निरोज',
  Nishan: 'निशान',
  Padam: 'पदम',
  Parash: 'पारस',
  Prabhu: 'प्रभु',
  Prabin: 'प्रविन',
  Pranil: 'प्रनिल',
  Prasanna: 'प्रसन्न',
  Pratap: 'प्रताप',
  Pravin: 'प्रविण',
  Purna: 'पूर्ण',
  Pushkar: 'पुष्कर',
  Rabi: 'रवि',
  Radhe: 'राधे',
  Raghab: 'राघव',
  Rajeev: 'राजीव',
  Ranjan: 'रञ्जन',
  Ranvir: 'रणवीर',
  Ratan: 'रतन',
  Rishi: 'ऋषि',
  Ritesh: 'रितेश',
  Rohan: 'रोहन',
  Rupak: 'रुपक',
  Rupesh: 'रुपेश',
  Sabik: 'साबिक',
  Sabir: 'साबिर',
  Sachin: 'सचिन',
  Sahil: 'साहिल',
  Sailendra: 'शैलेन्द्र',
  Sajan: 'सजन',
  Samir: 'समीर',
  Sampad: 'सम्पद',
  Samrat: 'सम्राट',
  Sandesh: 'सन्देश',
  Sanjaya: 'सञ्जय',
  Sanjeev: 'सञ्जीव',
  Sarvendra: 'सर्वेन्द्र',
  Satish: 'सतीश',
  Shailesh: 'शैलेश',
  Shankar: 'शंकर',
  Shashi: 'शशि',
  Shikhar: 'शिखर',
  Shrawan: 'श्रवण',
  Shree: 'श्री',
  Shreedhar: 'श्रीधर',
  Siddhartha: 'सिद्धार्थ',
  Sitaram: 'सीताराम',
  Subodh: 'सुबोध',
  Sudan: 'सुदन',
  Sudarshan: 'सुदर्शन',
  Sudhir: 'सुधीर',
  Sujit: 'सुजित',
  Sundar: 'सुन्दर',
  Surendra: 'सुरेन्द्र',
  Surya: 'सूर्य',
  Tej: 'तेज',
  Tekendra: 'टेकेन्द्र',
  Tribhuvan: 'त्रिभुवन',
  Uday: 'उदय',
  Udit: 'उदित',
  Upendra: 'उपेन्द्र',
  Uttam: 'उत्तम',
  Varun: 'वरुण',
  Vibhusan: 'विभूषण',
  Vijay: 'विजय',
  Vikas: 'विकास',
  Vinay: 'विनय',
  Yogendra: 'योगेन्द्र',
  Yogesh: 'योगेश',

  // Female (extended)
  Aanchal: 'आँचल',
  Aaradhana: 'आराधना',
  Aarti: 'आरती',
  Aastha: 'आस्था',
  Amita: 'अमिता',
  Anisha: 'अनिशा',
  Anshu: 'अंशु',
  Anu: 'अनु',
  Anupa: 'अनुपा',
  Anupama: 'अनुपमा',
  Barkha: 'बर्खा',
  Basundhara: 'वसुन्धरा',
  Bhagawati: 'भगवती',
  Bhawana: 'भावना',
  Bhumika: 'भूमिका',
  Bibha: 'विभा',
  Bipasha: 'विपाशा',
  Chandika: 'चण्डिका',
  Chandra: 'चन्द्रा',
  Charu: 'चारु',
  Chhaya: 'छाया',
  Damanta: 'दमन्ता',
  Devaki: 'देवकी',
  Dilmaya: 'दिलमाया',
  Dipa: 'दीपा',
  Dipika: 'दीपिका',
  Gauri: 'गौरी',
  Gunjan: 'गुञ्जन',
  Indu: 'इन्दु',
  Janaki: 'जानकी',
  Jasmine: 'जस्मिन',
  Kamana: 'कामना',
  Kritika: 'कृतिका',
  Leela: 'लीला',
  Lila: 'लीला',
  Mala: 'माला',
  Manila: 'मनिला',
  Manita: 'मनिता',
  Manju: 'मन्जु',
  Meena: 'मीना',
  Minu: 'मीनु',
  Mira: 'मीरा',
  Mithila: 'मिथिला',
  Monika: 'मोनिका',
  Munna: 'मुन्ना',
  Neelam: 'नीलम',
  Neetu: 'नीतु',
  Neha: 'नेहा',
  Nibha: 'निभा',
  Nikita: 'निकिता',
  Nilam: 'निलम',
  Nira: 'नीरा',
  Nirmala: 'निर्मला',
  Nita: 'नीता',
  Nutandevi: 'नूतनदेवी',
  Ojashwi: 'ओजस्वी',
  Padma: 'पद्मा',
  Pari: 'परी',
  Parikshya: 'परीक्षा',
  Paroma: 'पारोमा',
  Paru: 'पारु',
  Prabha: 'प्रभा',
  Pranisha: 'प्रनिशा',
  Prarthana: 'प्रार्थना',
  Prashanna: 'प्रसन्ना',
  Prerana: 'प्रेरणा',
  Priti: 'प्रीति',
  Punpun: 'पुनपुन',
  Ragini: 'रागिनी',
  Rajkumari: 'राजकुमारी',
  Rakshya: 'रक्षा',
  Reena: 'रीना',
  Reeta: 'रीता',
  Rejina: 'रेजिना',
  Renuka: 'रेणुका',
  Rina: 'रीना',
  Rita: 'रीता',
  Riya: 'रिया',
  Rohini: 'रोहिणी',
  Roma: 'रोमा',
  Roopa: 'रूपा',
  Roshani: 'रोशनी',
  Sabitri: 'सावित्री',
  Salina: 'सलिना',
  Samana: 'समना',
  Sameera: 'समीरा',
  Samita: 'समिता',
  Samjhana: 'सम्झना',
  Sampada: 'सम्पदा',
  Samridhi: 'समृद्धि',
  Sanjita: 'सञ्जिता',
  Sarala: 'सरला',
  Sarmila: 'शर्मिला',
  Sarojini: 'सरोजिनी',
  Seema: 'सीमा',
  Shanta: 'शान्ता',
  Sheela: 'शीला',
  Shikha: 'शिखा',
  Shila: 'शिला',
  Shubha: 'शुभा',
  Sima: 'सीमा',
  Sobha: 'शोभा',
  Sona: 'सोना',
  Sonam: 'सोनम',
  Sonika: 'सोनिका',
  Subhadra: 'सुभद्रा',
  Subina: 'सुबिना',
  Suchana: 'सूचना',
  Sukriti: 'सुकृति',
  Sulochana: 'सुलोचना',
  Sumitra: 'सुमित्रा',
  Sunayana: 'सुनयना',
  Supriya: 'सुप्रिया',
  Surakshya: 'सुरक्षा',
  Swastika: 'स्वस्तिका',
  Tanushree: 'तनुश्री',
  Tulasa: 'तुलसा',
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
  'QA Engineer': 'क्यूए इन्जिनियर',
  'Frontend Developer': 'फ्रन्टइन्ड डेभलपर',
  'Backend Developer': 'ब्याकइन्ड डेभलपर',
  'DevOps Engineer': 'डेभअप्स इन्जिनियर',
  'Mobile App Developer': 'मोबाइल एप डेभलपर',
  'Data Analyst': 'डाटा विश्लेषक',
  'Civil Engineer': 'सिभिल इन्जिनियर',
  'Architect': 'वास्तुविद्',
  'Electrical Engineer': 'विद्युत इन्जिनियर',
  'Accountant': 'लेखापाल',
  'Chartered Accountant': 'चार्टर्ड एकाउन्टेन्ट',
  'Credit Officer': 'कर्जा अधिकृत',
  'Branch Manager': 'शाखा प्रबन्धक',
  'Bank Manager': 'बैंक प्रबन्धक',
  'Teacher': 'शिक्षक',
  'Secondary School Teacher': 'माध्यमिक तह शिक्षक',
  'Lecturer': 'प्राध्यापक',
  'Senior Lecturer': 'वरिष्ठ प्राध्यापक',
  'School Principal': 'प्रधानाध्यापक',
  'Marketing Officer': 'बजार अधिकृत',
  'Marketing Executive': 'बजार व्यवस्थापक',
  'Human Resources Officer': 'मानव स्रोत अधिकृत',
  'Administrative Assistant': 'प्रशासनिक सहायक',
  'Administrative Officer': 'प्रशासनिक अधिकृत',
  'Supply Chain Coordinator': 'आपूर्ति शृङ्खला संयोजक',
  'Medical Officer': 'मेडिकल अधिकृत',
  'Medical Doctor': 'चिकित्सक / डाक्टर',
  'Registered Nurse': 'दर्तावाल नर्स',
  'Staff Nurse': 'स्टाफ नर्स',
  'Pharmacist': 'औषधीविद् / फार्मासिस्ट',
  'Agriculture Officer': 'कृषि अधिकृत',
  'Veterinary Doctor': 'पशु चिकित्सक',
  'Hotel General Manager': 'होटल महाप्रबन्धक',
  'Chef de Partie': 'शेफ डे पार्टी',
  'Journalist': 'पत्रकार',
  'Graphic Designer': 'ग्राफिक डिजाइनर',
  'Farmer / Agriculturalist': 'कृषक / किसान',
  'Lead Farmer': 'अगुवा कृषक',
  'Student': 'विद्यार्थी',
  'Business Owner / Entrepreneur': 'व्यवसायी / उद्यमी',
  'Managing Director': 'प्रबन्ध निर्देशक',
  'Branch Officer': 'शाखा अधिकृत',
  'Finance Officer': 'वित्त अधिकृत',
  'Operations Specialist': 'सञ्चालन विशेषज्ञ',
  'Tourism Officer': 'पर्यटन अधिकृत',
  'Professional': 'पेशाकर्मी',
  'Officer': 'अधिकृत',
};

/**
 * Common Departments in Devanagari
 */
export const DEPARTMENTS_DEVANAGARI: Record<string, string> = {
  'Engineering': 'इन्जिनियरिङ शाखा',
  'Information Technology': 'सूचना प्रविधि शाखा',
  'Quality Assurance': 'गुणस्तर सुनिश्चितता शाखा',
  'Infrastructure & Cloud': 'पूर्वाधार तथा क्लाउड शाखा',
  'Analytics & Intelligence': 'तथ्याङ्क विश्लेषण शाखा',
  'Engineering & Construction': 'इन्जिनियरिङ तथा निर्माण शाखा',
  'Design & Planning': 'डिजाइन तथा योजना शाखा',
  'Finance & Accounts': 'लेखा तथा वित्त शाखा',
  'Audit & Taxation': 'लेखापरीक्षण तथा कर शाखा',
  'Credit & Loans': 'कर्जा शाखा',
  'Branch Operations': 'शाखा सञ्चालन',
  'Academic Department': 'शैक्षिक विभाग',
  'Faculty of Sciences': 'विज्ञान संकाय',
  'Operations': 'सञ्चालन शाखा',
  'Administration': 'प्रशासन शाखा',
  'Marketing & Sales': 'बजार तथा बिक्री शाखा',
  'Marketing & Public Relations': 'बजार तथा जनसम्पर्क शाखा',
  'Human Resources': 'मानव स्रोत शाखा',
  'Logistics & Procurement': 'ढुवानी तथा खरिद शाखा',
  'Clinical Services': 'क्लिनिकल सेवा शाखा',
  'Nursing & Patient Care': 'नर्सिङ तथा बिरामी सेवा शाखा',
  'Pharmacy Services': 'फार्मेसी सेवा शाखा',
  'Agri-Extension & Development': 'कृषि प्रसार तथा विकास शाखा',
  'Animal Husbandry': 'पशुपालन शाखा',
  'Hospitality & Operations': 'आतिथ्य तथा सञ्चालन शाखा',
  'Food & Beverage': 'खाद्य तथा पेय शाखा',
  'Editorial & News': 'सम्पादन तथा समाचार शाखा',
  'Creative & Branding': 'सिर्जनात्मक तथा ब्रान्डिङ शाखा',
  'Customer Support': 'ग्राहक सेवा शाखा',
  'Academic Affairs': 'शैक्षिक शाखा',
  'Agricultural Operations': 'कृषि सञ्चालन शाखा',
  'Executive Management': 'कार्यकारी व्यवस्थापन',
};

/**
 * Teaching subjects in Devanagari
 */
export const SUBJECTS_DEVANAGARI: Record<string, string> = {
  'Mathematics': 'गणित',
  'Physics': 'भौतिक विज्ञान',
  'English Literature': 'अंग्रेजी साहित्य',
  'Nepali': 'नेपाली',
  'Social Studies': 'सामाजिक अध्ययन',
  'Computer Science': 'कम्प्युटर विज्ञान',
  'Economics': 'अर्थशास्त्र',
  'Chemistry': 'रसायन विज्ञान',
};

/**
 * Faculties / institutes in Devanagari
 */
export const FACULTIES_DEVANAGARI: Record<string, string> = {
  'Faculty of Science & Technology': 'विज्ञान तथा प्रविधि संकाय',
  'Faculty of Management': 'व्यवस्थापन संकाय',
  'Faculty of Humanities & Social Sciences': 'मानविकी तथा सामाजिक विज्ञान संकाय',
  'Institute of Engineering': 'इन्जिनियरिङ अध्ययन संस्थान',
  'Institute of Medicine': 'चिकित्साशास्त्र अध्ययन संस्थान',
  'Science & Information Technology': 'विज्ञान तथा सूचना प्रविधि',
};

/**
 * Academic grades in Devanagari
 */
export const GRADES_DEVANAGARI: Record<string, string> = {
  'Masters Degree': 'स्नातकोत्तर (मास्टर्स)',
  'Bachelors Degree': 'स्नातक (ब्याचलर्स)',
  'Grade 12': 'कक्षा १२',
};

/**
 * Educational institutions (src/data/institutions.json) in Devanagari
 */
export const INSTITUTIONS_DEVANAGARI: Record<string, string> = {
  'Tribhuvan University': 'त्रिभुवन विश्वविद्यालय',
  'Kathmandu University': 'काठमाडौँ विश्वविद्यालय',
  'Pokhara University': 'पोखरा विश्वविद्यालय',
  'Purbanchal University': 'पूर्वाञ्चल विश्वविद्यालय',
  'Mid-Western University': 'मध्यपश्चिम विश्वविद्यालय',
  'Far-Western University': 'सुदूरपश्चिम विश्वविद्यालय',
  'Pulchowk Campus (IOE)': 'पुल्चोक क्याम्पस (इन्जिनियरिङ अध्ययन संस्थान)',
  'Thapathali Campus (IOE)': 'थापाथली क्याम्पस (इन्जिनियरिङ अध्ययन संस्थान)',
  "St. Xavier's College": 'सेन्ट जेभियर्स कलेज',
  'Amrit Science Campus (ASCOL)': 'अमृत विज्ञान क्याम्पस',
  'Patan Multiple Campus': 'पाटन संयुक्त क्याम्पस',
  'Prithvi Narayan Campus': 'पृथ्वीनारायण क्याम्पस',
  'Mahendra Morang Adarsh Multiple Campus': 'महेन्द्र मोरङ आदर्श बहुमुखी क्याम्पस',
  'Budhanilkantha School': 'बुढानीलकण्ठ स्कुल',
  "St. Mary's High School": 'सेन्ट मेरिज हाई स्कुल',
  'Gandaki Boarding School': 'गण्डकी बोर्डिङ स्कुल',
};

/**
 * Companies (src/data/companies.json) in Devanagari
 */
export const COMPANIES_DEVANAGARI: Record<string, string> = {
  'Danphe Digital Solutions Pvt. Ltd.': 'डाँफे डिजिटल सोलुसन्स प्रा. लि.',
  'Himalayan Cloud Technologies': 'हिमालयन क्लाउड टेक्नोलोजिज',
  'Yeti Software Labs Nepal': 'यती सफ्टवेयर ल्याब्स नेपाल',
  'Sagarmatha InfoSys Pvt. Ltd.': 'सगरमाथा इन्फोसिस प्रा. लि.',
  'Kathmandu Code Works': 'काठमाडौँ कोड वर्क्स',
  'Machhapuchhre Innovations Pvt. Ltd.': 'माछापुच्छ्रे इनोभेसन्स प्रा. लि.',
  'Gorkha Construction & Engineering': 'गोरखा कन्स्ट्रक्सन एण्ड इन्जिनियरिङ',
  'Annapurna Infrastructure Developers': 'अन्नपूर्ण इन्फ्रास्ट्रक्चर डेभलपर्स',
  'Bagmati Builders & Architects': 'बागमती बिल्डर्स एण्ड आर्किटेक्ट्स',
  'Lumbini Merchant Capital Ltd.': 'लुम्बिनी मर्चेन्ट क्यापिटल लि.',
  'Karnali Financial Services Pvt. Ltd.': 'कर्णाली फाइनान्सियल सर्भिसेज प्रा. लि.',
  'Shikhar Commercial Advisors': 'शिखर कमर्सियल एड्भाइजर्स',
  'Everest Horizons Group': 'एभरेस्ट होराइजन्स ग्रुप',
  'Namaste Logistics & Trading': 'नमस्ते लजिस्टिक्स एण्ड ट्रेडिङ',
  'Nepal Multi-Trade Enterprises': 'नेपाल मल्टि-ट्रेड इन्टरप्राइजेज',
  'Chitwan Health Sciences Center': 'चितवन हेल्थ साइन्सेस सेन्टर',
  'Himalayan Care Poly Clinic': 'हिमालयन केयर पोलि क्लिनिक',
  'Muktinath Organic Agro Farms': 'मुक्तिनाथ अर्गानिक एग्रो फार्म्स',
  'Koshi Dairy & Agri Products': 'कोशी डेरी एण्ड एग्री प्रोडक्ट्स',
  'Dhaulagiri Heritage Resort & Spa': 'धौलागिरी हेरिटेज रिसोर्ट एण्ड स्पा',
  'Pokhara View Grand Hotel': 'पोखरा भ्यू ग्रान्ड होटल',
  'Himal Media Network Pvt. Ltd.': 'हिमाल मिडिया नेटवर्क प्रा. लि.',
  'Kantipur Creative Studio': 'कान्तिपुर क्रिएटिभ स्टुडियो',
};

/**
 * Toles (src/data/geography/toles.json) in Devanagari
 */
export const TOLES_DEVANAGARI: Record<string, string> = {
  'Naya Bazar': 'नयाँ बजार',
  'Purano Bazar': 'पुरानो बजार',
  'Milan Chowk': 'मिलन चोक',
  'Shanti Tole': 'शान्ति टोल',
  'Pragati Tole': 'प्रगति टोल',
  'Adarsha Nagar': 'आदर्श नगर',
  'Ganesh Chowk': 'गणेश चोक',
  'Shiva Chowk': 'शिव चोक',
  'Durbar Marga': 'दरबार मार्ग',
  'Main Road': 'मेन रोड',
  'Hospital Road': 'अस्पताल रोड',
  'Campus Chowk': 'क्याम्पस चोक',
  'Devi Tole': 'देवी टोल',
  'Bhanu Chowk': 'भानु चोक',
  'Laxmi Marg': 'लक्ष्मी मार्ग',
  'New Road': 'न्यु रोड',
  'Thamel': 'ठमेल',
  'Baneshwar': 'बानेश्वर',
  'Koteshwar': 'कोटेश्वर',
  'Putalisadak': 'पुतलीसडक',
  'Baluwatar': 'बालुवाटार',
  'Maitighar': 'माइतीघर',
  'Kalanki': 'कलंकी',
  'Chabahil': 'चाबहिल',
  'Maharajgunj': 'महाराजगञ्ज',
  'Jawalakhel': 'जावलाखेल',
  'Kupondole': 'कुपण्डोल',
  'Kumaripati': 'कुमारीपाटी',
  'Pulchowk': 'पुल्चोक',
  'Mangalbazar': 'मंगलबजार',
  'Lakeside': 'लेकसाइड',
  'Mahendrapool': 'महेन्द्रपुल',
  'Chipledhunga': 'चिप्लेढुङ्गा',
  'Prithvi Chowk': 'पृथ्वी चोक',
  'Bagar': 'बगर',
  'Traffic Chowk': 'ट्राफिक चोक',
  'Bargachhi': 'बरगाछी',
  'Kanchanbari': 'कञ्चनबारी',
  'Golpark': 'गोलपार्क',
  'Amarpath': 'अमरपथ',
  'Hattisar': 'हात्तीसार',
  'Buspark': 'बसपार्क',
  'Pipara': 'पिपरा',
  'Tribhuvan Chowk': 'त्रिभुवन चोक',
  'Dhamboji': 'धम्बोजी',
};

/**
 * Farmer crop types in Devanagari
 */
export const CROPS_DEVANAGARI: Record<string, string> = {
  'Paddy (Dhan)': 'धान',
  'Maize (Makai)': 'मकै',
  'Organic Tea': 'अर्गानिक चिया',
  'Large Cardamom (Alainchi)': 'अलैंची',
  'Himalayan Coffee': 'हिमाली कफी',
  'Dairy Farming': 'दुग्ध व्यवसाय (पशुपालन)',
  'Vegetable Farming': 'तरकारी खेती',
};

/**
 * Business registration types in Devanagari
 */
export const BUSINESS_TYPES_DEVANAGARI: Record<string, string> = {
  'Private Limited': 'प्राइभेट लिमिटेड',
  'Proprietorship': 'एकल स्वामित्व',
  'Partnership Firm': 'साझेदारी फर्म',
};

/**
 * Common English words seen in organisation names, designations and departments.
 * Keys are lower case.
 */
const COMMON_WORDS_DEVANAGARI: Record<string, string> = {
  'pvt.': 'प्रा.', pvt: 'प्रा.', 'ltd.': 'लि.', ltd: 'लि.', limited: 'लिमिटेड', private: 'प्राइभेट',
  '&': 'तथा', and: 'तथा', of: '', the: '',
  bank: 'बैंक', branch: 'शाखा', department: 'विभाग', company: 'कम्पनी', group: 'ग्रुप',
  enterprises: 'इन्टरप्राइजेज', enterprise: 'इन्टरप्राइज', trading: 'ट्रेडिङ', concern: 'कन्सर्न',
  innovations: 'इनोभेसन्स', suppliers: 'सप्लायर्स', services: 'सेवा', service: 'सेवा',
  officer: 'अधिकृत', manager: 'प्रबन्धक', engineer: 'इन्जिनियर', administrator: 'प्रशासक',
  director: 'निर्देशक', managing: 'प्रबन्ध', executive: 'कार्यकारी', senior: 'वरिष्ठ', junior: 'कनिष्ठ',
  assistant: 'सहायक', chief: 'प्रमुख', head: 'प्रमुख', super: 'सुपर', quality: 'गुणस्तर',
  assurance: 'सुनिश्चितता', security: 'सुरक्षा', nepal: 'नेपाल', cloud: 'क्लाउड', trade: 'ट्रेड',
  syndicate: 'सिन्डिकेट', retail: 'खुद्रा', distribution: 'वितरण', science: 'विज्ञान', sciences: 'विज्ञान',
  information: 'सूचना', technology: 'प्रविधि', campus: 'क्याम्पस', college: 'कलेज', school: 'स्कुल',
  university: 'विश्वविद्यालय', bachelor: 'स्नातक', master: 'स्नातकोत्तर', year: 'वर्ष', semester: 'सेमेस्टर',
  '1st': 'पहिलो', '2nd': 'दोस्रो', '3rd': 'तेस्रो', '4th': 'चौथो', '5th': 'पाँचौँ',
  farmer: 'किसान', teacher: 'शिक्षक', student: 'विद्यार्थी', road: 'रोड', chowk: 'चोक', tole: 'टोल',
  marg: 'मार्ग', bazar: 'बजार', nagar: 'नगर', cooperative: 'सहकारी', agriculture: 'कृषि',
  hospital: 'अस्पताल', clinic: 'क्लिनिक', hotel: 'होटल', developer: 'डेभलपर', analyst: 'विश्लेषक',
  sales: 'बिक्री', marketing: 'बजार', finance: 'वित्त', accounts: 'लेखा', operations: 'सञ्चालन',
  administration: 'प्रशासन', support: 'सहयोग', customer: 'ग्राहक', research: 'अनुसन्धान',
};

const ACRONYM_LETTERS: Record<string, string> = {
  A: 'ए', B: 'बी', C: 'सी', D: 'डी', E: 'ई', F: 'एफ', G: 'जी', H: 'एच', I: 'आई', J: 'जे', K: 'के', L: 'एल', M: 'एम',
  N: 'एन', O: 'ओ', P: 'पी', Q: 'क्यू', R: 'आर', S: 'एस', T: 'टी', U: 'यू', V: 'भी', W: 'डब्लु', X: 'एक्स', Y: 'वाई', Z: 'जेड',
};

// Longest patterns first
const LATIN_CONSONANTS: Array<[string, string]> = [
  ['chh', 'छ'], ['ksh', 'क्ष'], ['kh', 'ख'], ['gh', 'घ'], ['ch', 'च'], ['jh', 'झ'], ['th', 'थ'], ['dh', 'ध'],
  ['ph', 'फ'], ['bh', 'भ'], ['sh', 'श'], ['k', 'क'], ['g', 'ग'], ['c', 'क'], ['j', 'ज'], ['t', 'त'], ['d', 'द'],
  ['n', 'न'], ['p', 'प'], ['f', 'फ'], ['b', 'ब'], ['m', 'म'], ['y', 'य'], ['r', 'र'], ['l', 'ल'], ['v', 'भ'],
  ['w', 'व'], ['s', 'स'], ['h', 'ह'], ['x', 'क्स'], ['z', 'ज'], ['q', 'क'],
];

// [latin, independent vowel, dependent sign (matra)]
const LATIN_VOWELS: Array<[string, string, string]> = [
  ['aa', 'आ', 'ा'], ['ai', 'ऐ', 'ै'], ['au', 'औ', 'ौ'], ['ee', 'ई', 'ी'], ['oo', 'ऊ', 'ू'], ['ow', 'ओ', 'ो'],
  ['a', 'अ', ''], ['i', 'इ', 'ि'], ['u', 'उ', 'ु'], ['e', 'ए', 'े'], ['o', 'ओ', 'ो'],
];

/**
 * Simple phonetic Latin -> Devanagari transliteration used as the last-resort fallback
 * (e.g. "Ganesh" -> "गनेश", "Shyam" -> "श्याम"). Consonant clusters get a halant, a word-final
 * consonant keeps its inherent vowel, digits become Nepali numerals. The output never contains
 * Latin letters. It is deliberately simple; prefer the curated dictionaries whenever possible.
 */
export function transliterateLatin(text: string): string {
  const lower = text.toLowerCase();
  let out = '';
  let i = 0;
  let prevConsonant = false;

  while (i < lower.length) {
    const vowel = LATIN_VOWELS.find(([latin]) => lower.startsWith(latin, i));
    if (vowel) {
      out += prevConsonant ? vowel[2] : vowel[1];
      prevConsonant = false;
      i += vowel[0].length;
      continue;
    }
    const consonant = LATIN_CONSONANTS.find(([latin]) => lower.startsWith(latin, i));
    if (consonant) {
      if (prevConsonant) out += '्';
      out += consonant[1];
      prevConsonant = true;
      i += consonant[0].length;
      continue;
    }
    const ch = lower[i];
    if (ch !== "'") out += ch;
    prevConsonant = false;
    i++;
  }

  return toNepaliNumerals(out);
}

function lookupWord(word: string): string | undefined {
  return (
    FIRST_NAMES_DEVANAGARI[word] ||
    SURNAMES_DEVANAGARI[word] ||
    DISTRICTS_DEVANAGARI[word] ||
    PROVINCES_DEVANAGARI[word] ||
    TOLES_DEVANAGARI[word] ||
    PLACE_WORDS_DEVANAGARI[word]
  );
}

const PLACE_WORDS_DEVANAGARI: Record<string, string> = {
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
  Pokhara: 'पोखरा',
  Birat: 'विराट',
};

/**
 * Transliterates free text (organisation names, designations, departments...) to Devanagari
 * word by word: curated dictionaries first, acronyms letter by letter, then phonetic fallback.
 */
export function transliterateText(text: string): string {
  if (!text) return '';
  const trimmed = text.trim();
  const direct = lookupWord(trimmed);
  if (direct) return direct;

  return trimmed
    .split(/(\s+|\/|,|\(|\))/)
    .map((token) => {
      if (!token || /^(\s+|\/|,|\(|\))$/.test(token)) return token;
      const known = lookupWord(token);
      if (known) return known;
      const common = COMMON_WORDS_DEVANAGARI[token.toLowerCase()];
      if (common !== undefined) return common;
      if (/^[A-Z]{2,5}$/.test(token)) {
        return token.split('').map((ch) => ACRONYM_LETTERS[ch]).join('');
      }
      if (/[A-Za-z]/.test(token)) return transliterateLatin(token);
      return toNepaliNumerals(token);
    })
    .join('')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Transliterates a person's name ("Ram Bahadur Thapa") using the name dictionaries,
 * falling back to phonetic transliteration for unknown parts.
 */
export function transliterateName(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .map((part) => FIRST_NAMES_DEVANAGARI[part] || SURNAMES_DEVANAGARI[part] || transliterateLatin(part))
    .join(' ');
}

/**
 * Transliterates an English local body name into authentic Nepali Devanagari.
 * Uses the official Devanagari names in municipalities.json when available.
 */
export function transliterateMunicipality(name: string, district?: string): string {
  const known = NepalDataEngine.findMunicipality(name, district) || NepalDataEngine.findMunicipality(name);
  if (known?.nameNp && known.name.toLowerCase() === name.trim().toLowerCase()) {
    return known.nameNp;
  }

  const base = stripMunicipalitySuffix(name);
  const type = inferMunicipalityType(name);
  const hasSuffix = base !== name.trim();
  const baseNp = transliterateText(base);
  if (!hasSuffix) return baseNp;

  const suffixNp: Record<MunicipalityType, string> = {
    'Metropolitan City': 'महानगरपालिका',
    'Sub-Metropolitan City': 'उपमहानगरपालिका',
    'Municipality': 'नगरपालिका',
    'Rural Municipality': 'गाउँपालिका',
  };
  return `${baseNp} ${suffixNp[type]}`;
}

/**
 * Transliterates a given name, surname, tole, or word to Nepali Devanagari.
 */
export function transliterateWord(word: string): string {
  if (!word) return '';
  return transliterateText(word);
}

const NP_MUNICIPALITY_SUFFIX_REGEX = /\s*(उपमहानगरपालिका|महानगरपालिका|गाउँपालिका|नगरपालिका)$/;

function translateDistrict(district: string): string {
  return DISTRICTS_DEVANAGARI[district] || transliterateText(district);
}

function translateProvince(province: string): string {
  return PROVINCES_DEVANAGARI[province] || transliterateText(province);
}

function translateOrganisation(name: string): string {
  return (
    COMPANIES_DEVANAGARI[name] ||
    INSTITUTIONS_DEVANAGARI[name] ||
    findCommercialBank(name)?.nameNp ||
    transliterateText(name)
  );
}

function translateDrivingLicenseCategory(category: string): string {
  const letters = category.replace(/^Category\s+/i, '').split('(')[0];
  const has = (letter: string) => new RegExp(`\\b${letter}\\b`).test(letters);
  if (has('A') && has('B')) return "वर्ग 'क', 'ख' (मोटरसाइकल तथा कार)";
  if (has('B')) return "वर्ग 'ख' (कार/जीप/भ्यान)";
  if (has('K')) return "वर्ग 'ट' (स्कुटर/मोपेड)";
  if (has('A')) return "वर्ग 'क' (मोटरसाइकल)";
  return transliterateText(category);
}

function buildAddressNp(addr: NepalAddress) {
  const province = translateProvince(addr.province);
  const district = translateDistrict(addr.district);
  const municipality = transliterateMunicipality(addr.municipality, addr.district);
  const ward = `वडा नं. ${toNepaliNumerals(addr.ward)}`;
  const tole = TOLES_DEVANAGARI[addr.tole] || transliterateText(addr.tole);
  return {
    province,
    district,
    municipality,
    ward,
    tole,
    fullAddress: `${tole}, ${ward}, ${municipality}, ${district}, ${province}`,
  };
}

/**
 * Builds full DevanagariDetails for a synthetic person.
 */
export function generateDevanagariDetails(person: SyntheticPerson): DevanagariDetails {
  const nepFirstName = FIRST_NAMES_DEVANAGARI[person.firstName] || transliterateName(person.firstName);
  const nepLastName = SURNAMES_DEVANAGARI[person.lastName] || transliterateName(person.lastName);
  const nepMiddleName = person.middleName ? (FIRST_NAMES_DEVANAGARI[person.middleName] || transliterateName(person.middleName)) : undefined;

  const nepFullName = nepMiddleName
    ? `${nepFirstName} ${nepMiddleName} ${nepLastName}`
    : `${nepFirstName} ${nepLastName}`;

  const nepGender = person.gender === 'Male' ? 'पुरुष' : person.gender === 'Female' ? 'महिला' : 'अन्य';
  const nepHonorific = person.gender === 'Male' ? 'श्री' : person.age > 28 ? 'श्रीमती' : 'सुश्री';

  const perm = buildAddressNp(person.address);

  // Temporary / Current Address Devanagari
  const tempAddr = person.temporaryAddress || person.currentAddress;
  const temp = tempAddr ? buildAddressNp(tempAddr) : undefined;

  const nepOccupation = OCCUPATIONS_DEVANAGARI[person.occupation] || transliterateText(person.occupation);
  const nepJobTitle = OCCUPATIONS_DEVANAGARI[person.jobTitle] || transliterateText(person.jobTitle);
  const nepDesignation = person.designation
    ? OCCUPATIONS_DEVANAGARI[person.designation] || transliterateText(person.designation)
    : nepJobTitle;

  const departmentSubject = /^Department of (.+)$/.exec(person.department);
  const nepDepartment = DEPARTMENTS_DEVANAGARI[person.department]
    || (departmentSubject
      ? `${SUBJECTS_DEVANAGARI[departmentSubject[1]] || transliterateText(departmentSubject[1])} विभाग`
      : `${transliterateText(person.department)} शाखा`);

  // Company / employer name in Devanagari
  let nepCompany = translateOrganisation(person.companyName);

  // Archetype specifics
  const nepSchool = person.school ? translateOrganisation(person.school) : undefined;
  const nepGrade = person.grade ? GRADES_DEVANAGARI[person.grade] || transliterateText(person.grade) : undefined;
  const nepFaculty = person.faculty ? FACULTIES_DEVANAGARI[person.faculty] || transliterateText(person.faculty) : undefined;
  const nepGuardianName = person.guardianName ? transliterateName(person.guardianName) : undefined;
  const nepCropType = person.cropType ? CROPS_DEVANAGARI[person.cropType] || transliterateText(person.cropType) : undefined;

  let nepCooperative: string | undefined;
  if (person.cooperative) {
    const generatedSuffix = ' Sana Kisan Agriculture Cooperative Ltd.';
    if (person.cooperative.endsWith(generatedSuffix)) {
      const muniBaseNp = perm.municipality.replace(NP_MUNICIPALITY_SUFFIX_REGEX, '').trim();
      nepCooperative = `${muniBaseNp} साना किसान कृषि सहकारी संस्था लि.`;
    } else {
      nepCooperative = transliterateText(person.cooperative);
    }
  }
  if (person.profileType === 'farmer' && nepCooperative && person.companyName === person.cooperative) {
    nepCompany = nepCooperative;
  }

  let nepBusinessName: string | undefined;
  if (person.businessName) {
    nepBusinessName = person.businessName.startsWith(`${person.lastName} `)
      ? `${nepLastName} ${transliterateText(person.businessName.slice(person.lastName.length + 1))}`
      : transliterateText(person.businessName);
    if (person.companyName === person.businessName) nepCompany = nepBusinessName;
  }

  const passportOfficeMatch = person.passportIssuedBy ? /^DAO, (.+)$/.exec(person.passportIssuedBy) : null;
  const bank = person.bankName ? findCommercialBank(person.bankName) : undefined;

  return {
    honorific: nepHonorific,
    firstName: nepFirstName,
    middleName: nepMiddleName,
    lastName: nepLastName,
    fullName: nepFullName,
    gender: nepGender,
    province: perm.province,
    district: perm.district,
    municipality: perm.municipality,
    ward: perm.ward,
    tole: perm.tole,
    fullAddress: perm.fullAddress,

    permanentProvince: perm.province,
    permanentDistrict: perm.district,
    permanentMunicipality: perm.municipality,
    permanentWard: perm.ward,
    permanentTole: perm.tole,
    permanentFullAddress: perm.fullAddress,

    tempProvince: temp?.province,
    tempDistrict: temp?.district,
    tempMunicipality: temp?.municipality,
    tempWard: temp?.ward,
    tempTole: temp?.tole,
    tempFullAddress: temp?.fullAddress,

    currentProvince: temp?.province,
    currentDistrict: temp?.district,
    currentMunicipality: temp?.municipality,
    currentWard: temp?.ward,
    currentTole: temp?.tole,
    currentFullAddress: temp?.fullAddress,

    occupation: nepOccupation,
    jobTitle: nepJobTitle,
    department: nepDepartment,
    companyName: nepCompany,
    designation: nepDesignation,
    businessName: nepBusinessName,
    businessType: person.businessType ? BUSINESS_TYPES_DEVANAGARI[person.businessType] || transliterateText(person.businessType) : undefined,
    school: nepSchool,
    grade: nepGrade,
    faculty: nepFaculty,
    guardianName: nepGuardianName,
    cropType: nepCropType,
    cooperative: nepCooperative,
    subject: person.subject ? SUBJECTS_DEVANAGARI[person.subject] || transliterateText(person.subject) : undefined,

    // Government Documents in Devanagari
    citizenshipNumber: person.citizenshipNumber ? toNepaliNumerals(person.citizenshipNumber) : undefined,
    citizenshipIssueDistrict: person.citizenshipIssueDistrict ? translateDistrict(person.citizenshipIssueDistrict) : perm.district,
    citizenshipIssueDateBS: person.citizenshipIssueDateBS ? toNepaliNumerals(person.citizenshipIssueDateBS) : undefined,
    citizenshipIssuedBy: person.citizenshipIssueDistrict ? `जिल्ला प्रशासन कार्यालय, ${translateDistrict(person.citizenshipIssueDistrict)}` : undefined,
    nationalId: person.nationalId ? toNepaliNumerals(person.nationalId) : undefined,
    passportNumber: person.passportNumber,
    passportIssueDate: person.passportIssueDate ? toNepaliNumerals(person.passportIssueDate) : undefined,
    passportExpiryDate: person.passportExpiryDate ? toNepaliNumerals(person.passportExpiryDate) : undefined,
    passportIssuedBy: !person.passportIssuedBy
      ? undefined
      : person.passportIssuedBy === 'Department of Passports, Kathmandu'
      ? 'राहदानी विभाग, काठमाडौँ'
      : passportOfficeMatch
      ? `जिल्ला प्रशासन कार्यालय, ${translateDistrict(passportOfficeMatch[1])}`
      : transliterateText(person.passportIssuedBy),
    drivingLicenseNumber: person.drivingLicenseNumber ? toNepaliNumerals(person.drivingLicenseNumber) : undefined,
    drivingLicenseCategory: person.drivingLicenseCategory ? translateDrivingLicenseCategory(person.drivingLicenseCategory) : undefined,
    drivingLicenseIssueDate: person.drivingLicenseIssueDate ? toNepaliNumerals(person.drivingLicenseIssueDate) : undefined,
    drivingLicenseExpiryDate: person.drivingLicenseExpiryDate ? toNepaliNumerals(person.drivingLicenseExpiryDate) : undefined,

    // FinTech, Banking & Digital Wallets in Devanagari
    bankName: person.bankName ? (bank?.nameNp || transliterateText(person.bankName)) : undefined,
    bankBranch: person.bankBranch ? (translateBankBranch(person.bankBranch) || transliterateText(person.bankBranch)) : undefined,
    bankAccountNumber: person.bankAccountNumber ? toNepaliNumerals(person.bankAccountNumber) : undefined,
    bankAccountName: nepFullName,
    esewaId: person.esewaId ? toNepaliNumerals(person.esewaId) : undefined,
    khaltiId: person.khaltiId ? toNepaliNumerals(person.khaltiId) : undefined,

    // Medical & Personal
    bloodGroup: person.bloodGroup ? BLOOD_GROUPS_DEVANAGARI[person.bloodGroup] : undefined,
  };
}
