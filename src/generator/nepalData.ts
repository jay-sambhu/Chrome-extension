export interface MunicipalityData {
  name: string;
  type: 'Metropolitan City' | 'Sub-Metropolitan City' | 'Municipality' | 'Rural Municipality';
  maxWards: number;
}

export interface DistrictData {
  name: string;
  municipalities: MunicipalityData[];
}

export interface ProvinceData {
  name: string;
  districts: DistrictData[];
}

export const NEPAL_GEOGRAPHY: ProvinceData[] = [
  {
    name: 'Koshi Province',
    districts: [
      {
        name: 'Morang',
        municipalities: [
          { name: 'Biratnagar Metropolitan City', type: 'Metropolitan City', maxWards: 19 },
          { name: 'Belbari Municipality', type: 'Municipality', maxWards: 11 },
          { name: 'Sundarharaicha Municipality', type: 'Municipality', maxWards: 12 },
          { name: 'Pathari Shanischare Municipality', type: 'Municipality', maxWards: 10 },
        ],
      },
      {
        name: 'Sunsari',
        municipalities: [
          { name: 'Dharan Sub-Metropolitan City', type: 'Sub-Metropolitan City', maxWards: 20 },
          { name: 'Itahari Sub-Metropolitan City', type: 'Sub-Metropolitan City', maxWards: 20 },
          { name: 'Inaruwa Municipality', type: 'Municipality', maxWards: 10 },
        ],
      },
      {
        name: 'Jhapa',
        municipalities: [
          { name: 'Birtamod Municipality', type: 'Municipality', maxWards: 10 },
          { name: 'Damak Municipality', type: 'Municipality', maxWards: 10 },
          { name: 'Mechinagar Municipality', type: 'Municipality', maxWards: 15 },
          { name: 'Bhadrapur Municipality', type: 'Municipality', maxWards: 10 },
        ],
      },
    ],
  },
  {
    name: 'Madhesh Province',
    districts: [
      {
        name: 'Dhanusha',
        municipalities: [
          { name: 'Janakpurdham Sub-Metropolitan City', type: 'Sub-Metropolitan City', maxWards: 25 },
          { name: 'Mithila Municipality', type: 'Municipality', maxWards: 11 },
        ],
      },
      {
        name: 'Parsa',
        municipalities: [
          { name: 'Birgunj Metropolitan City', type: 'Metropolitan City', maxWards: 32 },
          { name: 'Pokhariya Municipality', type: 'Municipality', maxWards: 10 },
        ],
      },
    ],
  },
  {
    name: 'Bagmati Province',
    districts: [
      {
        name: 'Kathmandu',
        municipalities: [
          { name: 'Kathmandu Metropolitan City', type: 'Metropolitan City', maxWards: 32 },
          { name: 'Kirtipur Municipality', type: 'Municipality', maxWards: 10 },
          { name: 'Budhanilkantha Municipality', type: 'Municipality', maxWards: 13 },
          { name: 'Tokha Municipality', type: 'Municipality', maxWards: 11 },
          { name: 'Chandragiri Municipality', type: 'Municipality', maxWards: 15 },
        ],
      },
      {
        name: 'Lalitpur',
        municipalities: [
          { name: 'Lalitpur Metropolitan City', type: 'Metropolitan City', maxWards: 29 },
          { name: 'Mahalaxmi Municipality', type: 'Municipality', maxWards: 10 },
          { name: 'Godawari Municipality', type: 'Municipality', maxWards: 14 },
        ],
      },
      {
        name: 'Bhaktapur',
        municipalities: [
          { name: 'Bhaktapur Municipality', type: 'Municipality', maxWards: 10 },
          { name: 'Madhyapur Thimi Municipality', type: 'Municipality', maxWards: 9 },
          { name: 'Suryabinayak Municipality', type: 'Municipality', maxWards: 10 },
          { name: 'Changunarayan Municipality', type: 'Municipality', maxWards: 9 },
        ],
      },
      {
        name: 'Chitwan',
        municipalities: [
          { name: 'Bharatpur Metropolitan City', type: 'Metropolitan City', maxWards: 29 },
          { name: 'Ratnanagar Municipality', type: 'Municipality', maxWards: 16 },
        ],
      },
    ],
  },
  {
    name: 'Gandaki Province',
    districts: [
      {
        name: 'Kaski',
        municipalities: [
          { name: 'Pokhara Metropolitan City', type: 'Metropolitan City', maxWards: 33 },
          { name: 'Annapurna Rural Municipality', type: 'Rural Municipality', maxWards: 11 },
        ],
      },
      {
        name: 'Tanahun',
        municipalities: [
          { name: 'Byas Municipality', type: 'Municipality', maxWards: 14 },
          { name: 'Shuklagandaki Municipality', type: 'Municipality', maxWards: 12 },
        ],
      },
    ],
  },
  {
    name: 'Lumbini Province',
    districts: [
      {
        name: 'Rupandehi',
        municipalities: [
          { name: 'Butwal Sub-Metropolitan City', type: 'Sub-Metropolitan City', maxWards: 19 },
          { name: 'Siddharthanagar Municipality', type: 'Municipality', maxWards: 13 },
          { name: 'Tilottama Municipality', type: 'Municipality', maxWards: 17 },
        ],
      },
      {
        name: 'Dang',
        municipalities: [
          { name: 'Ghorahi Sub-Metropolitan City', type: 'Sub-Metropolitan City', maxWards: 19 },
          { name: 'Tulsipur Sub-Metropolitan City', type: 'Sub-Metropolitan City', maxWards: 19 },
        ],
      },
    ],
  },
  {
    name: 'Karnali Province',
    districts: [
      {
        name: 'Surkhet',
        municipalities: [
          { name: 'Birendranagar Municipality', type: 'Municipality', maxWards: 16 },
          { name: 'Bheriganga Municipality', type: 'Municipality', maxWards: 13 },
        ],
      },
    ],
  },
  {
    name: 'Sudurpashchim Province',
    districts: [
      {
        name: 'Kailali',
        municipalities: [
          { name: 'Dhangadhi Sub-Metropolitan City', type: 'Sub-Metropolitan City', maxWards: 19 },
          { name: 'Tikapur Municipality', type: 'Municipality', maxWards: 9 },
        ],
      },
      {
        name: 'Kanchanpur',
        municipalities: [
          { name: 'Bhimdatta Municipality', type: 'Municipality', maxWards: 19 },
          { name: 'Bedkot Municipality', type: 'Municipality', maxWards: 10 },
        ],
      },
    ],
  },
];

export const MALE_FIRST_NAMES = [
  'Aarav', 'Bibek', 'Bikash', 'Binod', 'Deepak', 'Dipen', 'Kiran', 'Manish',
  'Nabin', 'Prakash', 'Prashant', 'Pradip', 'Rajesh', 'Ramesh', 'Rohan',
  'Roshan', 'Sandesh', 'Sanjiv', 'Santosh', 'Saroj', 'Subash', 'Sujit',
  'Suman', 'Sunil', 'Suraj', 'Suresh', 'Umesh'
];

export const FEMALE_FIRST_NAMES = [
  'Aastha', 'Anju', 'Anita', 'Bipana', 'Deepa', 'Dikshya', 'Gita', 'Kopila',
  'Manita', 'Nabina', 'Pooja', 'Prashanna', 'Pratima', 'Priya', 'Priyanka',
  'Rachana', 'Rejina', 'Ritu', 'Sabina', 'Sadhana', 'Samjhana', 'Sarita',
  'Shristi', 'Smriti', 'Srijana', 'Sunita', 'Sushma'
];

export const SURNAMES = [
  'Adhikari', 'Aryal', 'Basnet', 'Bhandari', 'Bhattarai', 'Bhujel', 'Budhathoki',
  'Chaudhary', 'Dahal', 'Gautam', 'Ghimire', 'Gurung', 'Karki', 'Kattel',
  'KC', 'Khadka', 'Koirala', 'Lamichhane', 'Magar', 'Maharjan', 'Neupane',
  'Oli', 'Pandey', 'Paudel', 'Pokharel', 'Pradhan', 'Pun', 'Rai', 'Rana',
  'Regmi', 'Rijal', 'Sapkota', 'Sharma', 'Shrestha', 'Subedi', 'Tamang',
  'Thapa', 'Timilsina', 'Upreti'
];

export const OCCUPATIONS = [
  { title: 'Software Engineer', department: 'Engineering', company: 'Himalayan Cloud Labs' },
  { title: 'QA Engineer', department: 'Quality Assurance', company: 'Yeti Software Solutions' },
  { title: 'Frontend Developer', department: 'Product Development', company: 'Danphe Digital Pvt. Ltd.' },
  { title: 'Civil Engineer', department: 'Engineering', company: 'Sagarmatha Infrastructure' },
  { title: 'Accountant', department: 'Finance & Accounts', company: 'Gorkha Traders & Suppliers' },
  { title: 'Teacher', department: 'Academic Department', company: 'Himal Academy' },
  { title: 'Marketing Officer', department: 'Marketing', company: 'Namaste Media Network' },
  { title: 'HR Manager', department: 'Human Resources', company: 'Everest Innovations' },
  { title: 'Project Coordinator', department: 'Operations', company: 'Lumbini Development Council' },
  { title: 'Branch Officer', department: 'Operations', company: 'Machhapuchhre Enterprises' },
];

export const TOLES = [
  'Naya Bazar', 'Purano Bazar', 'Milan Chowk', 'Shanti Tole', 'Pragati Tole',
  'Adarsha Nagar', 'Ganesh Chowk', 'Shiva Chowk', 'Durbar Marga', 'Main Road',
  'Hospital Road', 'Campus Chowk', 'Devi Tole', 'Bhanu Chowk', 'Laxmi Marg'
];

export const PHONE_PREFIXES = ['984', '985', '986', '980', '981', '982', '974', '975', '976'];
export const TEST_EMAIL_DOMAINS = ['example.test', 'testmail.com.np', 'devtest.np'];
