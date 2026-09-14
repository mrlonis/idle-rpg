import {
  SILTBACK_GRAZER,
  WAKEPAD_PROWLER,
  MIRETHROAT_CALLER,
  RUNOUT_BOUNDER,
  BANKROOT_BRUTE,
  GAPTRACK_HUNTER,
  REEDLUNG_CALLER,
  SLIPSTREAM_HUNTER,
  SHOALHIDE_BEAST,
  FOAMSPUR_HUNTER,
  DEEPWATER_CALLER,
  LASTBANK_BEAST,
  UNDERTOW_HUNTER,
  WAKEHOLLOW_CALLER,
  THE_PACEBREAKER,
  THE_WAKE_MAW,
  FAULTDUST_WALKER,
  SPLITGRAVE_BEARER,
  SEAMFEELER_DEAD,
  HOLLOWEDGE_PORTER,
} from './enemies';

/** The Dragwake: keep the back rank acting while separate hunters accelerate.
 * Four fixed Monster cohorts; one caller per board, temporary single-target SLOW.
 * Undead returns occupy 6/6/4/2/0/0 slots across the six bands.
 * Twenty distinct bodies, fourteen of eighteen ordinary IDs new; 282/300 slots Monster.
 * Three-root authored sweeps: 7,200 victories, zero timeouts, 36.8s longest fight.
 */
export const CHAPTER_31 = {
  id: 'chapter-31',
  name: 'The Dragwake',
  stages: [
    {
      id: 'c31-s1',
      name: 'Water In The Graves',
      enemies: {
        front: [SILTBACK_GRAZER, MIRETHROAT_CALLER],
        back: [FAULTDUST_WALKER, WAKEPAD_PROWLER, SILTBACK_GRAZER],
      },
      level: 755,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s2',
      name: 'The Dragging Silt',
      enemies: {
        front: [SILTBACK_GRAZER, MIRETHROAT_CALLER],
        back: [SPLITGRAVE_BEARER, WAKEPAD_PROWLER, SILTBACK_GRAZER],
      },
      level: 756,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s3',
      name: 'Tracks Beneath The Surface',
      enemies: {
        front: [SILTBACK_GRAZER, MIRETHROAT_CALLER],
        back: [SEAMFEELER_DEAD, WAKEPAD_PROWLER, SILTBACK_GRAZER],
      },
      level: 756,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s4',
      name: 'A Throat Among The Reeds',
      enemies: {
        front: [SILTBACK_GRAZER, MIRETHROAT_CALLER],
        back: [HOLLOWEDGE_PORTER, WAKEPAD_PROWLER, SILTBACK_GRAZER],
      },
      level: 757,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s5',
      name: 'The Submerged Path',
      enemies: {
        front: [SILTBACK_GRAZER, MIRETHROAT_CALLER],
        back: [FAULTDUST_WALKER, WAKEPAD_PROWLER, SILTBACK_GRAZER],
      },
      level: 757,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s6',
      name: 'Bones Against The Bank',
      enemies: {
        front: [SILTBACK_GRAZER, MIRETHROAT_CALLER],
        back: [SPLITGRAVE_BEARER, WAKEPAD_PROWLER, SILTBACK_GRAZER],
      },
      level: 758,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s7',
      name: 'Where The Water Pulls',
      enemies: {
        front: [SILTBACK_GRAZER, MIRETHROAT_CALLER],
        back: [WAKEPAD_PROWLER, WAKEPAD_PROWLER, SILTBACK_GRAZER],
      },
      level: 758,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s8',
      name: 'Across The Runout',
      enemies: {
        front: [SILTBACK_GRAZER, MIRETHROAT_CALLER],
        back: [WAKEPAD_PROWLER, WAKEPAD_PROWLER, SILTBACK_GRAZER],
      },
      level: 759,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s9',
      name: 'A Ripple Behind You',
      enemies: {
        front: [SILTBACK_GRAZER, MIRETHROAT_CALLER],
        back: [WAKEPAD_PROWLER, WAKEPAD_PROWLER, SILTBACK_GRAZER],
      },
      level: 759,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s10',
      name: 'The Pacebreaker',
      enemies: {
        front: [SILTBACK_GRAZER, SILTBACK_GRAZER],
        back: [WAKEPAD_PROWLER, WAKEPAD_PROWLER, THE_PACEBREAKER],
      },
      level: 760,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s11',
      name: 'Tracks Beside The Wake',
      enemies: {
        front: [SILTBACK_GRAZER, MIRETHROAT_CALLER],
        back: [SEAMFEELER_DEAD, RUNOUT_BOUNDER, SILTBACK_GRAZER],
      },
      level: 760,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s12',
      name: 'The First Bound',
      enemies: {
        front: [SILTBACK_GRAZER, MIRETHROAT_CALLER],
        back: [HOLLOWEDGE_PORTER, RUNOUT_BOUNDER, SILTBACK_GRAZER],
      },
      level: 761,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s13',
      name: 'A Call Within Reach',
      enemies: {
        front: [SILTBACK_GRAZER, MIRETHROAT_CALLER],
        back: [FAULTDUST_WALKER, RUNOUT_BOUNDER, SILTBACK_GRAZER],
      },
      level: 761,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s14',
      name: 'Claws On The Bank',
      enemies: {
        front: [SILTBACK_GRAZER, MIRETHROAT_CALLER],
        back: [SPLITGRAVE_BEARER, RUNOUT_BOUNDER, SILTBACK_GRAZER],
      },
      level: 762,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s15',
      name: 'Following The Ripples',
      enemies: {
        front: [SILTBACK_GRAZER, SILTBACK_GRAZER],
        back: [SEAMFEELER_DEAD, RUNOUT_BOUNDER, MIRETHROAT_CALLER],
      },
      level: 762,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s16',
      name: 'Through The Broken Reeds',
      enemies: {
        front: [SILTBACK_GRAZER, SILTBACK_GRAZER],
        back: [HOLLOWEDGE_PORTER, RUNOUT_BOUNDER, MIRETHROAT_CALLER],
      },
      level: 763,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s17',
      name: 'A Hunter Takes Cover',
      enemies: {
        front: [SILTBACK_GRAZER, SILTBACK_GRAZER],
        back: [RUNOUT_BOUNDER, RUNOUT_BOUNDER, MIRETHROAT_CALLER],
      },
      level: 763,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s18',
      name: 'The Farther Shore',
      enemies: {
        front: [SILTBACK_GRAZER, SILTBACK_GRAZER],
        back: [RUNOUT_BOUNDER, RUNOUT_BOUNDER, MIRETHROAT_CALLER],
      },
      level: 764,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s19',
      name: 'Footprints Fill With Water',
      enemies: {
        front: [SILTBACK_GRAZER, SILTBACK_GRAZER],
        back: [RUNOUT_BOUNDER, RUNOUT_BOUNDER, MIRETHROAT_CALLER],
      },
      level: 764,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s20',
      name: 'The Pacebreaker Returns',
      enemies: {
        front: [SILTBACK_GRAZER, SILTBACK_GRAZER],
        back: [RUNOUT_BOUNDER, RUNOUT_BOUNDER, THE_PACEBREAKER],
      },
      level: 765,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s21',
      name: 'The Pack Takes The Gap',
      enemies: {
        front: [BANKROOT_BRUTE, BANKROOT_BRUTE],
        back: [FAULTDUST_WALKER, GAPTRACK_HUNTER, REEDLUNG_CALLER],
      },
      level: 765,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s22',
      name: 'Two Trails Divide',
      enemies: {
        front: [BANKROOT_BRUTE, BANKROOT_BRUTE],
        back: [SPLITGRAVE_BEARER, GAPTRACK_HUNTER, REEDLUNG_CALLER],
      },
      level: 766,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s23',
      name: 'Reeds Around The Caller',
      enemies: {
        front: [BANKROOT_BRUTE, BANKROOT_BRUTE],
        back: [SEAMFEELER_DEAD, GAPTRACK_HUNTER, REEDLUNG_CALLER],
      },
      level: 766,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s24',
      name: 'A Bone In The Current',
      enemies: {
        front: [BANKROOT_BRUTE, BANKROOT_BRUTE],
        back: [HOLLOWEDGE_PORTER, GAPTRACK_HUNTER, REEDLUNG_CALLER],
      },
      level: 767,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s25',
      name: 'The Sheltered Throat',
      enemies: {
        front: [BANKROOT_BRUTE, BANKROOT_BRUTE],
        back: [GAPTRACK_HUNTER, GAPTRACK_HUNTER, REEDLUNG_CALLER],
      },
      level: 767,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s26',
      name: 'Across The Packground',
      enemies: {
        front: [BANKROOT_BRUTE, BANKROOT_BRUTE],
        back: [GAPTRACK_HUNTER, GAPTRACK_HUNTER, REEDLUNG_CALLER],
      },
      level: 768,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s27',
      name: 'Between The Hunters',
      enemies: {
        front: [BANKROOT_BRUTE, BANKROOT_BRUTE],
        back: [GAPTRACK_HUNTER, GAPTRACK_HUNTER, REEDLUNG_CALLER],
      },
      level: 768,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s28',
      name: 'The Flooded Cut',
      enemies: {
        front: [BANKROOT_BRUTE, BANKROOT_BRUTE],
        back: [GAPTRACK_HUNTER, GAPTRACK_HUNTER, REEDLUNG_CALLER],
      },
      level: 769,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s29',
      name: 'Gathering At The Bend',
      enemies: {
        front: [BANKROOT_BRUTE, BANKROOT_BRUTE],
        back: [GAPTRACK_HUNTER, GAPTRACK_HUNTER, REEDLUNG_CALLER],
      },
      level: 769,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s30',
      name: 'The Third Call',
      enemies: {
        front: [BANKROOT_BRUTE, BANKROOT_BRUTE],
        back: [GAPTRACK_HUNTER, GAPTRACK_HUNTER, THE_PACEBREAKER],
      },
      level: 770,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s31',
      name: 'No Easy Reach',
      enemies: {
        front: [BANKROOT_BRUTE, BANKROOT_BRUTE],
        back: [FAULTDUST_WALKER, REEDLUNG_CALLER, SLIPSTREAM_HUNTER],
      },
      level: 770,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s32',
      name: 'A Voice On The Left',
      enemies: {
        front: [BANKROOT_BRUTE, BANKROOT_BRUTE],
        back: [SPLITGRAVE_BEARER, REEDLUNG_CALLER, SLIPSTREAM_HUNTER],
      },
      level: 771,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s33',
      name: 'The Moving Screen',
      enemies: {
        front: [BANKROOT_BRUTE, BANKROOT_BRUTE],
        back: [SLIPSTREAM_HUNTER, SLIPSTREAM_HUNTER, REEDLUNG_CALLER],
      },
      level: 771,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s34',
      name: 'Where The Bank Narrows',
      enemies: {
        front: [BANKROOT_BRUTE, BANKROOT_BRUTE],
        back: [SLIPSTREAM_HUNTER, REEDLUNG_CALLER, SLIPSTREAM_HUNTER],
      },
      level: 772,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s35',
      name: 'Claws Beyond The Reeds',
      enemies: {
        front: [BANKROOT_BRUTE, BANKROOT_BRUTE],
        back: [REEDLUNG_CALLER, SLIPSTREAM_HUNTER, SLIPSTREAM_HUNTER],
      },
      level: 772,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s36',
      name: 'A Voice Across The Water',
      enemies: {
        front: [BANKROOT_BRUTE, BANKROOT_BRUTE],
        back: [SLIPSTREAM_HUNTER, SLIPSTREAM_HUNTER, REEDLUNG_CALLER],
      },
      level: 773,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s37',
      name: 'The Last Carried Bones',
      enemies: {
        front: [BANKROOT_BRUTE, BANKROOT_BRUTE],
        back: [SLIPSTREAM_HUNTER, REEDLUNG_CALLER, SLIPSTREAM_HUNTER],
      },
      level: 773,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s38',
      name: 'Hunters Change Banks',
      enemies: {
        front: [BANKROOT_BRUTE, BANKROOT_BRUTE],
        back: [REEDLUNG_CALLER, SLIPSTREAM_HUNTER, SLIPSTREAM_HUNTER],
      },
      level: 774,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s39',
      name: 'The Caller Holds Back',
      enemies: {
        front: [BANKROOT_BRUTE, BANKROOT_BRUTE],
        back: [SLIPSTREAM_HUNTER, SLIPSTREAM_HUNTER, REEDLUNG_CALLER],
      },
      level: 774,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s40',
      name: 'The Fourth Call',
      enemies: {
        front: [BANKROOT_BRUTE, BANKROOT_BRUTE],
        back: [SLIPSTREAM_HUNTER, SLIPSTREAM_HUNTER, THE_PACEBREAKER],
      },
      level: 775,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s41',
      name: 'The Dry Footholds End',
      enemies: {
        front: [SHOALHIDE_BEAST, SHOALHIDE_BEAST],
        back: [DEEPWATER_CALLER, FOAMSPUR_HUNTER, FOAMSPUR_HUNTER],
      },
      level: 775,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s42',
      name: 'A Stone Below The Surface',
      enemies: {
        front: [SHOALHIDE_BEAST, SHOALHIDE_BEAST],
        back: [FOAMSPUR_HUNTER, FOAMSPUR_HUNTER, DEEPWATER_CALLER],
      },
      level: 776,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s43',
      name: 'Foam Along The Trail',
      enemies: {
        front: [SHOALHIDE_BEAST, SHOALHIDE_BEAST],
        back: [FOAMSPUR_HUNTER, DEEPWATER_CALLER, FOAMSPUR_HUNTER],
      },
      level: 776,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s44',
      name: 'The Pack Runs Wide',
      enemies: {
        front: [SHOALHIDE_BEAST, SHOALHIDE_BEAST],
        back: [DEEPWATER_CALLER, FOAMSPUR_HUNTER, FOAMSPUR_HUNTER],
      },
      level: 777,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s45',
      name: 'A Call From Deep Water',
      enemies: {
        front: [SHOALHIDE_BEAST, SHOALHIDE_BEAST],
        back: [FOAMSPUR_HUNTER, FOAMSPUR_HUNTER, DEEPWATER_CALLER],
      },
      level: 777,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s46',
      name: 'No Bank To Rest On',
      enemies: {
        front: [SHOALHIDE_BEAST, SHOALHIDE_BEAST],
        back: [FOAMSPUR_HUNTER, DEEPWATER_CALLER, FOAMSPUR_HUNTER],
      },
      level: 778,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s47',
      name: 'The Shoal Gives Way',
      enemies: {
        front: [SHOALHIDE_BEAST, SHOALHIDE_BEAST],
        back: [DEEPWATER_CALLER, FOAMSPUR_HUNTER, FOAMSPUR_HUNTER],
      },
      level: 778,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s48',
      name: 'Faster Than The Current',
      enemies: {
        front: [SHOALHIDE_BEAST, SHOALHIDE_BEAST],
        back: [FOAMSPUR_HUNTER, FOAMSPUR_HUNTER, DEEPWATER_CALLER],
      },
      level: 779,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s49',
      name: 'The Last Shallow Crossing',
      enemies: {
        front: [SHOALHIDE_BEAST, SHOALHIDE_BEAST],
        back: [FOAMSPUR_HUNTER, DEEPWATER_CALLER, FOAMSPUR_HUNTER],
      },
      level: 779,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s50',
      name: 'The Pacebreaker Falls',
      enemies: {
        front: [SHOALHIDE_BEAST, SHOALHIDE_BEAST],
        back: [FOAMSPUR_HUNTER, FOAMSPUR_HUNTER, THE_PACEBREAKER],
      },
      level: 780,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s51',
      name: 'The Wake Closes',
      enemies: {
        front: [LASTBANK_BEAST, LASTBANK_BEAST],
        back: [UNDERTOW_HUNTER, UNDERTOW_HUNTER, WAKEHOLLOW_CALLER],
      },
      level: 780,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s52',
      name: 'Beyond The Last Bank',
      enemies: {
        front: [LASTBANK_BEAST, LASTBANK_BEAST],
        back: [UNDERTOW_HUNTER, WAKEHOLLOW_CALLER, UNDERTOW_HUNTER],
      },
      level: 781,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s53',
      name: 'A Hollow Under Water',
      enemies: {
        front: [LASTBANK_BEAST, LASTBANK_BEAST],
        back: [WAKEHOLLOW_CALLER, UNDERTOW_HUNTER, UNDERTOW_HUNTER],
      },
      level: 781,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s54',
      name: 'The Undertow Path',
      enemies: {
        front: [LASTBANK_BEAST, LASTBANK_BEAST],
        back: [UNDERTOW_HUNTER, UNDERTOW_HUNTER, WAKEHOLLOW_CALLER],
      },
      level: 782,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s55',
      name: 'Two Hunters Wait',
      enemies: {
        front: [LASTBANK_BEAST, LASTBANK_BEAST],
        back: [UNDERTOW_HUNTER, WAKEHOLLOW_CALLER, UNDERTOW_HUNTER],
      },
      level: 782,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s56',
      name: 'The Narrow Wake',
      enemies: {
        front: [LASTBANK_BEAST, LASTBANK_BEAST],
        back: [WAKEHOLLOW_CALLER, UNDERTOW_HUNTER, UNDERTOW_HUNTER],
      },
      level: 783,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s57',
      name: 'A Throat Behind The Pack',
      enemies: {
        front: [LASTBANK_BEAST, LASTBANK_BEAST],
        back: [UNDERTOW_HUNTER, UNDERTOW_HUNTER, WAKEHOLLOW_CALLER],
      },
      level: 783,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s58',
      name: 'Into The Deep Runout',
      enemies: {
        front: [LASTBANK_BEAST, LASTBANK_BEAST],
        back: [UNDERTOW_HUNTER, WAKEHOLLOW_CALLER, UNDERTOW_HUNTER],
      },
      level: 784,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s59',
      name: 'Where The Wake Converges',
      enemies: {
        front: [LASTBANK_BEAST, LASTBANK_BEAST],
        back: [WAKEHOLLOW_CALLER, UNDERTOW_HUNTER, UNDERTOW_HUNTER],
      },
      level: 784,
      gear: { grade: 4, level: 100 },
    },
    {
      id: 'c31-s60',
      name: 'The Wake-Maw',
      enemies: {
        front: [LASTBANK_BEAST, LASTBANK_BEAST],
        back: [UNDERTOW_HUNTER, UNDERTOW_HUNTER, THE_WAKE_MAW],
      },
      level: 785,
      gear: { grade: 4, level: 100 },
    },
  ],
} as const;
