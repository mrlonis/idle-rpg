import {
  FAULTDUST_WALKER,
  SPLITGRAVE_BEARER,
  SEAMFEELER_DEAD,
  HOLLOWEDGE_PORTER,
  FAULTLINE_REAVER,
  OPENJOINT_STALKER,
  SPLITVAULT_LURKER,
  GRAVESEAM_LANCER,
  DEEPFAULT_KEEPER,
  SUNDERJOINT_DEAD,
  FAULTHEART_BEARER,
  LASTJOINT_WARDEN,
  THE_JOINTFINDER,
  THE_GRAVEFAULT,
  SHEAFLESS_SHADE,
  SPOILROOF_HAND,
  DEADROCK_BEARER,
  CAPSTONE_DRUDGE,
  LIDSTONE_WARDEN,
} from './enemies';

/**
 * The Gravefault — can the party reach the body whose frequent critical hits also hit hard?
 * Undead rise through the graves exposed by the Overburden's workings; Dwarf labour remains
 * along the opening passages and thins toward the faultheart.
 *
 * Six bands: separate halves (1–10), reachable overlap (11–20), protected overlap (21–30),
 * multiple protected carriers (31–40), mixed carriers (41–50), and the faultheart (51–60).
 * The Jointfinder returns at all five mini-bosses; the Gravefault appears only at the final.
 * All new bodies wear tank-profile gear. No new body carries sustain, status or an ultimate.
 * The fielded roster is 19 distinct bodies: twelve new ordinary Undead, five returning
 * ordinary bodies, and two new antagonists. The ordinary quota is 12/17 (70.6%). Undead
 * occupy 278 of 299 slots (93.0%); Dwarf slots by band are 4, 6, 5, 3, 2, 1.
 * Research, including the calibrated interaction and isolated placement controls, is recorded
 * in docs/chapter-30-plan.md. Levels climb 725–755; the reference five remain capped at 500.
 */
export const CHAPTER_30 = {
  id: 'chapter-30',
  name: 'The Gravefault',
  stages: [
    {
      id: 'c30-s1',
      name: 'Dust In The Cut',
      enemies: {
        front: [SHEAFLESS_SHADE, SPLITGRAVE_BEARER],
        back: [HOLLOWEDGE_PORTER, FAULTDUST_WALKER],
      },
      level: 725,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s2',
      name: 'A Grave Uncovered',
      enemies: {
        front: [FAULTDUST_WALKER, SPOILROOF_HAND],
        back: [SEAMFEELER_DEAD, HOLLOWEDGE_PORTER, SPLITGRAVE_BEARER],
      },
      level: 726,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s3',
      name: 'The Split Slab',
      enemies: {
        front: [FAULTDUST_WALKER, SPLITGRAVE_BEARER],
        back: [SEAMFEELER_DEAD, HOLLOWEDGE_PORTER, FAULTDUST_WALKER],
      },
      level: 726,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s4',
      name: 'Loose Mortar',
      enemies: {
        front: [FAULTDUST_WALKER, DEADROCK_BEARER],
        back: [SEAMFEELER_DEAD, HOLLOWEDGE_PORTER, SPLITGRAVE_BEARER],
      },
      level: 727,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s5',
      name: 'A Narrow Opening',
      enemies: {
        front: [FAULTDUST_WALKER, SPLITGRAVE_BEARER],
        back: [SEAMFEELER_DEAD, HOLLOWEDGE_PORTER, FAULTDUST_WALKER],
      },
      level: 727,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s6',
      name: 'The Broken Course',
      enemies: {
        front: [FAULTDUST_WALKER, CAPSTONE_DRUDGE],
        back: [SEAMFEELER_DEAD, HOLLOWEDGE_PORTER, SPLITGRAVE_BEARER],
      },
      level: 728,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s7',
      name: 'Between The Stones',
      enemies: {
        front: [FAULTDUST_WALKER, SPLITGRAVE_BEARER],
        back: [SEAMFEELER_DEAD, HOLLOWEDGE_PORTER, FAULTDUST_WALKER],
      },
      level: 728,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s8',
      name: 'Buried Work',
      enemies: {
        front: [FAULTDUST_WALKER, LIDSTONE_WARDEN],
        back: [SEAMFEELER_DEAD, HOLLOWEDGE_PORTER, SPLITGRAVE_BEARER],
      },
      level: 729,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s9',
      name: 'The First Joint',
      enemies: {
        front: [FAULTDUST_WALKER, SPLITGRAVE_BEARER],
        back: [SEAMFEELER_DEAD, HOLLOWEDGE_PORTER, FAULTDUST_WALKER],
      },
      level: 729,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s10',
      name: 'The Jointfinder',
      enemies: {
        front: [THE_JOINTFINDER, SPLITGRAVE_BEARER],
        back: [SEAMFEELER_DEAD, HOLLOWEDGE_PORTER, SPLITGRAVE_BEARER],
      },
      level: 730,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s11',
      name: 'Under The Slabs',
      enemies: {
        front: [FAULTLINE_REAVER, CAPSTONE_DRUDGE],
        back: [SEAMFEELER_DEAD, HOLLOWEDGE_PORTER, FAULTDUST_WALKER],
      },
      level: 730,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s12',
      name: 'The Open Vault',
      enemies: {
        front: [FAULTLINE_REAVER, SPLITGRAVE_BEARER],
        back: [SEAMFEELER_DEAD, HOLLOWEDGE_PORTER, OPENJOINT_STALKER],
      },
      level: 731,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s13',
      name: 'One Edge Meets Another',
      enemies: {
        front: [FAULTLINE_REAVER, LIDSTONE_WARDEN],
        back: [SEAMFEELER_DEAD, HOLLOWEDGE_PORTER, FAULTDUST_WALKER],
      },
      level: 731,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s14',
      name: 'A Hairline In Stone',
      enemies: {
        front: [FAULTLINE_REAVER, CAPSTONE_DRUDGE],
        back: [SEAMFEELER_DEAD, HOLLOWEDGE_PORTER, OPENJOINT_STALKER],
      },
      level: 732,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s15',
      name: 'The Fault Runs On',
      enemies: {
        front: [FAULTLINE_REAVER, SPLITGRAVE_BEARER],
        back: [SEAMFEELER_DEAD, HOLLOWEDGE_PORTER, FAULTDUST_WALKER],
      },
      level: 732,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s16',
      name: 'The Reachable Edge',
      enemies: {
        front: [FAULTLINE_REAVER, LIDSTONE_WARDEN],
        back: [SEAMFEELER_DEAD, HOLLOWEDGE_PORTER, OPENJOINT_STALKER],
      },
      level: 733,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s17',
      name: 'Close To The Cut',
      enemies: {
        front: [FAULTLINE_REAVER, CAPSTONE_DRUDGE],
        back: [SEAMFEELER_DEAD, HOLLOWEDGE_PORTER, FAULTDUST_WALKER],
      },
      level: 733,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s18',
      name: 'A Hand Through Stone',
      enemies: {
        front: [FAULTLINE_REAVER, SPLITGRAVE_BEARER],
        back: [SEAMFEELER_DEAD, HOLLOWEDGE_PORTER, OPENJOINT_STALKER],
      },
      level: 734,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s19',
      name: 'Two Halves Meeting',
      enemies: {
        front: [FAULTLINE_REAVER, LIDSTONE_WARDEN],
        back: [SEAMFEELER_DEAD, HOLLOWEDGE_PORTER, FAULTDUST_WALKER],
      },
      level: 734,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s20',
      name: 'The Joint Found',
      enemies: {
        front: [THE_JOINTFINDER, SPLITGRAVE_BEARER],
        back: [SEAMFEELER_DEAD, HOLLOWEDGE_PORTER, OPENJOINT_STALKER],
      },
      level: 735,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s21',
      name: 'Beyond The Opening',
      enemies: {
        front: [FAULTDUST_WALKER, FAULTLINE_REAVER],
        back: [OPENJOINT_STALKER, HOLLOWEDGE_PORTER, SPLITVAULT_LURKER],
      },
      level: 735,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s22',
      name: 'The Inner Slab',
      enemies: {
        front: [CAPSTONE_DRUDGE, FAULTLINE_REAVER],
        back: [OPENJOINT_STALKER, HOLLOWEDGE_PORTER, GRAVESEAM_LANCER],
      },
      level: 736,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s23',
      name: 'Behind The Bearers',
      enemies: {
        front: [LIDSTONE_WARDEN, FAULTLINE_REAVER],
        back: [OPENJOINT_STALKER, HOLLOWEDGE_PORTER, SPLITVAULT_LURKER],
      },
      level: 736,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s24',
      name: 'A Lance In The Dark',
      enemies: {
        front: [FAULTDUST_WALKER, FAULTLINE_REAVER],
        back: [OPENJOINT_STALKER, HOLLOWEDGE_PORTER, GRAVESEAM_LANCER],
      },
      level: 737,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s25',
      name: 'The Covered Edge',
      enemies: {
        front: [CAPSTONE_DRUDGE, FAULTLINE_REAVER],
        back: [OPENJOINT_STALKER, HOLLOWEDGE_PORTER, SPLITVAULT_LURKER],
      },
      level: 737,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s26',
      name: 'A Grave Behind A Grave',
      enemies: {
        front: [FAULTDUST_WALKER, FAULTLINE_REAVER],
        back: [OPENJOINT_STALKER, HOLLOWEDGE_PORTER, GRAVESEAM_LANCER],
      },
      level: 738,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s27',
      name: 'The Narrow Passage',
      enemies: {
        front: [LIDSTONE_WARDEN, FAULTLINE_REAVER],
        back: [OPENJOINT_STALKER, HOLLOWEDGE_PORTER, SPLITVAULT_LURKER],
      },
      level: 738,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s28',
      name: 'What The Stone Hides',
      enemies: {
        front: [CAPSTONE_DRUDGE, FAULTLINE_REAVER],
        back: [OPENJOINT_STALKER, HOLLOWEDGE_PORTER, GRAVESEAM_LANCER],
      },
      level: 739,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s29',
      name: 'Beyond The Living Reach',
      enemies: {
        front: [FAULTDUST_WALKER, FAULTLINE_REAVER],
        back: [OPENJOINT_STALKER, HOLLOWEDGE_PORTER, SPLITVAULT_LURKER],
      },
      level: 739,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s30',
      name: 'The Joint Behind',
      enemies: {
        front: [THE_JOINTFINDER, FAULTLINE_REAVER],
        back: [OPENJOINT_STALKER, HOLLOWEDGE_PORTER, GRAVESEAM_LANCER],
      },
      level: 740,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s31',
      name: 'The Split Galleries',
      enemies: {
        front: [FAULTLINE_REAVER, OPENJOINT_STALKER],
        back: [SPLITVAULT_LURKER, GRAVESEAM_LANCER, DEEPFAULT_KEEPER],
      },
      level: 740,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s32',
      name: 'Two Faults Running',
      enemies: {
        front: [LIDSTONE_WARDEN, OPENJOINT_STALKER],
        back: [SPLITVAULT_LURKER, GRAVESEAM_LANCER, SUNDERJOINT_DEAD],
      },
      level: 741,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s33',
      name: 'The Protected Join',
      enemies: {
        front: [FAULTLINE_REAVER, OPENJOINT_STALKER],
        back: [SPLITVAULT_LURKER, GRAVESEAM_LANCER, DEEPFAULT_KEEPER],
      },
      level: 741,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s34',
      name: 'Stone Between Us',
      enemies: {
        front: [FAULTLINE_REAVER, OPENJOINT_STALKER],
        back: [SPLITVAULT_LURKER, GRAVESEAM_LANCER, SUNDERJOINT_DEAD],
      },
      level: 742,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s35',
      name: 'The Second Edge',
      enemies: {
        front: [FAULTLINE_REAVER, OPENJOINT_STALKER],
        back: [SPLITVAULT_LURKER, GRAVESEAM_LANCER, DEEPFAULT_KEEPER],
      },
      level: 742,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s36',
      name: 'Under A Broken Arch',
      enemies: {
        front: [LIDSTONE_WARDEN, OPENJOINT_STALKER],
        back: [SPLITVAULT_LURKER, GRAVESEAM_LANCER, SUNDERJOINT_DEAD],
      },
      level: 743,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s37',
      name: 'The Converging Seams',
      enemies: {
        front: [FAULTLINE_REAVER, OPENJOINT_STALKER],
        back: [SPLITVAULT_LURKER, GRAVESEAM_LANCER, DEEPFAULT_KEEPER],
      },
      level: 743,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s38',
      name: 'The Vault Divides',
      enemies: {
        front: [FAULTLINE_REAVER, OPENJOINT_STALKER],
        back: [SPLITVAULT_LURKER, GRAVESEAM_LANCER, SUNDERJOINT_DEAD],
      },
      level: 744,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s39',
      name: 'Both Edges Waiting',
      enemies: {
        front: [LIDSTONE_WARDEN, OPENJOINT_STALKER],
        back: [SPLITVAULT_LURKER, GRAVESEAM_LANCER, DEEPFAULT_KEEPER],
      },
      level: 744,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s40',
      name: 'The Joint Within',
      enemies: {
        front: [THE_JOINTFINDER, OPENJOINT_STALKER],
        back: [SPLITVAULT_LURKER, GRAVESEAM_LANCER, SUNDERJOINT_DEAD],
      },
      level: 745,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s41',
      name: 'The Faultheart',
      enemies: {
        front: [FAULTLINE_REAVER, FAULTHEART_BEARER],
        back: [DEEPFAULT_KEEPER, SUNDERJOINT_DEAD, GRAVESEAM_LANCER],
      },
      level: 745,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s42',
      name: 'Deep In The Fracture',
      enemies: {
        front: [FAULTLINE_REAVER, FAULTHEART_BEARER],
        back: [DEEPFAULT_KEEPER, SUNDERJOINT_DEAD, LASTJOINT_WARDEN],
      },
      level: 746,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s43',
      name: 'Another Grave Opens',
      enemies: {
        front: [CAPSTONE_DRUDGE, FAULTHEART_BEARER],
        back: [DEEPFAULT_KEEPER, SUNDERJOINT_DEAD, GRAVESEAM_LANCER],
      },
      level: 746,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s44',
      name: 'The Meeting Seams',
      enemies: {
        front: [FAULTLINE_REAVER, FAULTHEART_BEARER],
        back: [DEEPFAULT_KEEPER, SUNDERJOINT_DEAD, LASTJOINT_WARDEN],
      },
      level: 747,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s45',
      name: 'The Whole Slab Parts',
      enemies: {
        front: [FAULTLINE_REAVER, FAULTHEART_BEARER],
        back: [DEEPFAULT_KEEPER, SUNDERJOINT_DEAD, GRAVESEAM_LANCER],
      },
      level: 747,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s46',
      name: 'Beneath The Bearers',
      enemies: {
        front: [FAULTLINE_REAVER, FAULTHEART_BEARER],
        back: [DEEPFAULT_KEEPER, SUNDERJOINT_DEAD, LASTJOINT_WARDEN],
      },
      level: 748,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s47',
      name: 'The Last Passage',
      enemies: {
        front: [FAULTLINE_REAVER, FAULTHEART_BEARER],
        back: [DEEPFAULT_KEEPER, SUNDERJOINT_DEAD, GRAVESEAM_LANCER],
      },
      level: 748,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s48',
      name: 'The Uncovered Dark',
      enemies: {
        front: [CAPSTONE_DRUDGE, FAULTHEART_BEARER],
        back: [DEEPFAULT_KEEPER, SUNDERJOINT_DEAD, LASTJOINT_WARDEN],
      },
      level: 749,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s49',
      name: 'The Heart Of The Split',
      enemies: {
        front: [FAULTLINE_REAVER, FAULTHEART_BEARER],
        back: [DEEPFAULT_KEEPER, SUNDERJOINT_DEAD, GRAVESEAM_LANCER],
      },
      level: 749,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s50',
      name: 'The Final Joint',
      enemies: {
        front: [THE_JOINTFINDER, FAULTHEART_BEARER],
        back: [DEEPFAULT_KEEPER, SUNDERJOINT_DEAD, LASTJOINT_WARDEN],
      },
      level: 750,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s51',
      name: 'The Last Stone',
      enemies: {
        front: [FAULTHEART_BEARER, LASTJOINT_WARDEN],
        back: [DEEPFAULT_KEEPER, SUNDERJOINT_DEAD, SPLITVAULT_LURKER],
      },
      level: 750,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s52',
      name: 'Under The Gravefield',
      enemies: {
        front: [FAULTHEART_BEARER, LASTJOINT_WARDEN],
        back: [DEEPFAULT_KEEPER, SUNDERJOINT_DEAD, GRAVESEAM_LANCER],
      },
      level: 751,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s53',
      name: 'All The Seams Meet',
      enemies: {
        front: [FAULTHEART_BEARER, LASTJOINT_WARDEN],
        back: [DEEPFAULT_KEEPER, SUNDERJOINT_DEAD, SPLITVAULT_LURKER],
      },
      level: 751,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s54',
      name: 'A Warden At The Split',
      enemies: {
        front: [FAULTHEART_BEARER, LASTJOINT_WARDEN],
        back: [DEEPFAULT_KEEPER, CAPSTONE_DRUDGE, GRAVESEAM_LANCER],
      },
      level: 752,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s55',
      name: 'The Buried Edge',
      enemies: {
        front: [FAULTHEART_BEARER, LASTJOINT_WARDEN],
        back: [DEEPFAULT_KEEPER, SUNDERJOINT_DEAD, SPLITVAULT_LURKER],
      },
      level: 752,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s56',
      name: 'No Stone Between',
      enemies: {
        front: [FAULTHEART_BEARER, LASTJOINT_WARDEN],
        back: [DEEPFAULT_KEEPER, SUNDERJOINT_DEAD, GRAVESEAM_LANCER],
      },
      level: 753,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s57',
      name: 'Through The Faultheart',
      enemies: {
        front: [FAULTHEART_BEARER, LASTJOINT_WARDEN],
        back: [DEEPFAULT_KEEPER, SUNDERJOINT_DEAD, SPLITVAULT_LURKER],
      },
      level: 753,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s58',
      name: 'The Open Gravefield',
      enemies: {
        front: [FAULTHEART_BEARER, LASTJOINT_WARDEN],
        back: [DEEPFAULT_KEEPER, SUNDERJOINT_DEAD, GRAVESEAM_LANCER],
      },
      level: 754,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s59',
      name: 'Where The Graves Meet',
      enemies: {
        front: [FAULTHEART_BEARER, LASTJOINT_WARDEN],
        back: [DEEPFAULT_KEEPER, SUNDERJOINT_DEAD, SPLITVAULT_LURKER],
      },
      level: 754,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c30-s60',
      name: 'The Gravefault',
      enemies: {
        front: [FAULTHEART_BEARER, LASTJOINT_WARDEN],
        back: [FAULTDUST_WALKER, HOLLOWEDGE_PORTER, THE_GRAVEFAULT],
      },
      level: 755,
      gear: { grade: 4, level: 100 },
    },
  ],
} as const;
