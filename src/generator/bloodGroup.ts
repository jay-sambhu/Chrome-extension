import { BloodGroup } from '../types';

export const BLOOD_GROUPS: BloodGroup[] = [
  'A+',
  'A-',
  'B+',
  'B-',
  'O+',
  'O-',
  'AB+',
  'AB-',
];

export const BLOOD_GROUPS_DEVANAGARI: Record<BloodGroup, string> = {
  'A+': 'ए पोजेटिभ (A+)',
  'A-': 'ए नेगेटिभ (A-)',
  'B+': 'बी पोजेटिभ (B+)',
  'B-': 'बी नेगेटिभ (B-)',
  'O+': 'ओ पोजेटिभ (O+)',
  'O-': 'ओ नेगेटिभ (O-)',
  'AB+': 'एबी पोजेटिभ (AB+)',
  'AB-': 'एबी नेगेटिभ (AB-)',
};

/**
 * Generates a realistic blood group based on Nepal demographic frequencies.
 */
export function generateRandomBloodGroup(): BloodGroup {
  const pool: BloodGroup[] = [
    'O+', 'O+', 'O+', 'O+', 'O+', 'O+', 'O+',
    'A+', 'A+', 'A+', 'A+', 'A+', 'A+',
    'B+', 'B+', 'B+', 'B+', 'B+',
    'AB+',
    'O-',
    'A-',
    'B-',
    'AB-',
  ];
  return pool[Math.floor(Math.random() * pool.length)];
}
