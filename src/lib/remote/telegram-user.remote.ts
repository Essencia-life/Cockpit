import { query } from '$app/server';

const users = [ // TODO store and read users from Redis DB
	{
		id: 752299211,
		first_name: 'Dawid',
		last_name: 'Ratajczak',
		username: 'DawidRatajczak'
	},
	{
		id: 1075004227,
		first_name: 'SiMona',
		last_name: null,
		username: null
	},
	{
		id: 1480238336,
		first_name: 'Gustav',
		last_name: null,
		username: null
	},
	{
		id: 8458374821,
		first_name: 'Davide',
		last_name: 'Serta',
		username: null
	},
	{
		id: 2069075276,
		first_name: 'Fiona',
		last_name: null,
		username: null
	},
	{
		id: 5194487522,
		first_name: 'Gianni',
		last_name: 'D’Agostino',
		username: 'gianni_dago'
	},
	{
		id: 6436197682,
		first_name: 'Nora',
		last_name: null,
		username: 'noralinnros'
	},
	{
		id: 1732532127,
		first_name: 'Johannes',
		last_name: null,
		username: 'yo_han_nes'
	},
	{
		id: 1792812980,
		first_name: 'Antoine',
		last_name: null,
		username: null
	},
	{
		id: 5069026659,
		first_name: 'Humbert',
		last_name: 'Loic',
		username: null
	},
	{
		id: 1252869750,
		first_name: 'Edgar',
		last_name: null,
		username: 'edgarsumsari'
	},
	{
		id: 5713837236,
		first_name: 'Birdy',
		last_name: null,
		username: 'WetterBird'
	},
	{
		id: 7786817620,
		first_name: 'Øystein',
		last_name: 'Skarsbø',
		username: null
	},
	{
		id: 1790863246,
		first_name: 'Petra',
		last_name: null,
		username: 'Petra_Aruna'
	},
	{
		id: 719042568,
		first_name: 'Thomas',
		last_name: null,
		username: 'MisterTom05'
	},
	{
		id: 48968362,
		first_name: 'Ben',
		last_name: null,
		username: 'bbuhler'
	},
	{
		id: 1317434844,
		first_name: 'Ilonka Kokila',
		last_name: 'Petal',
		username: null
	},
	{
		id: 7328535032,
		first_name: 'Fuchs',
		last_name: null,
		username: null
	},
	{
		id: 382758843,
		first_name: 'Maxi Moksha',
		last_name: '777',
		username: 'maximoksha'
	},
	{
		id: 7214496307,
		first_name: 'Katie',
		last_name: null,
		username: null
	},
	{
		id: 1725396079,
		first_name: 'Fuchs',
		last_name: null,
		username: null
	},
	{
		id: 6962574190,
		first_name: 'Nathalie',
		last_name: null,
		username: null
	},
	{
		id: 1421862273,
		first_name: 'Lisa',
		last_name: 'Marieke',
		username: 'BeyondEgos'
	},
	{
		id: 917424482,
		first_name: 'Nadine',
		last_name: 'Buhler',
		username: 'NadineBuhler'
	},
	{
		id: 1340910690,
		first_name: 'Alexandra',
		last_name: 'Hope',
		username: 'Alexandra_hope'
	},
	{
		id: 750840110,
		first_name: 'Babaji Gunter',
		last_name: 'Freude',
		username: 'BabajiHealing'
	},
	{
		id: 1366107453,
		first_name: 'Simon',
		last_name: 'Weickert',
		username: 'SimonWt'
	},
	{
		id: 564981028,
		first_name: 'Lua Jaie',
		last_name: null,
		username: null
	},
	{
		id: 5242258866,
		first_name: 'Andre',
		last_name: 'N',
		username: null
	},
	{
		id: 5371041776,
		first_name: 'Pieter',
		last_name: 'Vrij',
		username: null
	},
	{
		id: 7302535403,
		first_name: 'Alex',
		last_name: null,
		username: null
	},
	{
		id: 1691452160,
		first_name: 'Olivia',
		last_name: null,
		username: 'VaniceO'
	},
	{
		id: 5637146678,
		first_name: 'Eirune',
		last_name: null,
		username: 'Eirunee'
	},
	{
		id: 1188557055,
		first_name: 'Alex Divinekode Music',
		last_name: null,
		username: 'Humblekode'
	},
	{
		id: 1493844118,
		first_name: 'Esmee',
		last_name: 'Seidler',
		username: 'Esmee2101'
	},
	{
		id: 7698008160,
		first_name: 'Kristin',
		last_name: null,
		username: null
	},
	{
		id: 6899645261,
		first_name: 'Carmen',
		last_name: null,
		username: null
	},
	{
		id: 584631404,
		first_name: 'Vera',
		last_name: null,
		username: 'Veralotta'
	},
	{
		id: 385622767,
		first_name: 'Francesco',
		last_name: null,
		username: 'a_medicine_life'
	},
	{
		id: 1742548864,
		first_name: 'Fien',
		last_name: null,
		username: null
	},
	{
		id: 1611086418,
		first_name: 'Petra',
		last_name: 'Minarikova',
		username: 'PepulikPetra'
	},
	{
		id: 1027162214,
		first_name: 'Sebastian',
		last_name: null,
		username: null
	},
	{
		id: 1439893112,
		first_name: 'Jera',
		last_name: null,
		username: 'Jera1111'
	},
	{
		id: 463874201,
		first_name: 'Marta Rupā',
		last_name: null,
		username: 'martamayura'
	},
	{
		id: 842995541,
		first_name: 'Beatrice',
		last_name: null,
		username: null
	},
	{
		id: 701798288,
		first_name: 'Finn',
		last_name: null,
		username: 'Finnausen'
	},
	{
		id: 368619170,
		first_name: 'Anna',
		last_name: 'Steger',
		username: null
	},
	{
		id: 5227195802,
		first_name: 'Rosanna',
		last_name: 'Lopes',
		username: 'Rosannalopes'
	},
	{
		id: 5471038065,
		first_name: 'Aurin &',
		last_name: 'Sanna',
		username: 'solsang'
	},
	{
		id: 1436852845,
		first_name: 'Davide',
		last_name: null,
		username: null
	},
	{
		id: 5449754297,
		first_name: 'Erik',
		last_name: null,
		username: 'ohyeetje'
	},
	{
		id: 620990763,
		first_name: 'Camilla',
		last_name: null,
		username: 'LoveUnityFreeWorld'
	},
	{
		id: 1725600599,
		first_name: 'kathryn',
		last_name: 'bon ame',
		username: null
	},
	{
		id: 5830987838,
		first_name: 'Edgar',
		last_name: null,
		username: 'edgarlemon'
	},
	{
		id: 7415597835,
		first_name: 'Josiely',
		last_name: 'Arnoud',
		username: null
	},
	{
		id: 1025792873,
		first_name: 'Jonas',
		last_name: 'Stein',
		username: null
	},
	{
		id: 1626545245,
		first_name: 'Mary',
		last_name: null,
		username: null
	},
	{
		id: 8455215547,
		first_name: 'Nana',
		last_name: 'Jovanovic',
		username: null
	},
	{
		id: 7721609793,
		first_name: 'Geoff',
		last_name: 'Dunnett',
		username: null
	},
	{
		id: 5582936955,
		first_name: 'Elios',
		last_name: null,
		username: 'SairusAlv'
	},
	{
		id: 81337691,
		first_name: 'Rodrigo',
		last_name: null,
		username: 'Notari369'
	},
	{
		id: 1237979901,
		first_name: 'Angel',
		last_name: null,
		username: null
	},
	{
		id: 892865149,
		first_name: 'Erwan',
		last_name: null,
		username: 'Erwancdrik'
	},
	{
		id: 1264250735,
		first_name: 'Niv',
		last_name: 'David',
		username: null
	},
	{
		id: 932796567,
		first_name: 'Anne-Friné',
		last_name: null,
		username: null
	},
	{
		id: 5959229666,
		first_name: 'marina',
		last_name: 'racine',
		username: null
	},
	{
		id: 1188440794,
		first_name: 'Robert',
		last_name: 'Eldon',
		username: null
	},
	{
		id: 68878922,
		first_name: 'Lu Cathrine',
		last_name: null,
		username: null
	},
	{
		id: 7335155855,
		first_name: 'Farid',
		last_name: null,
		username: null
	},
	{
		id: 7874910033,
		first_name: 'Djina',
		last_name: null,
		username: null
	},
	{
		id: 1201028689,
		first_name: 'Eva-Maria',
		last_name: 'Keller',
		username: 'evamariasoul'
	},
	{
		id: 6164959298,
		first_name: 'Clélia',
		last_name: 'Mercier',
		username: 'Clelia_Sacredflow'
	},
	{
		id: 1797983073,
		first_name: 'Annelle 🪷',
		last_name: 'Telepathic communication with animals & Tantric massage therapis',
		username: 'Annelle8'
	},
	{
		id: 1698679536,
		first_name: 'YDA',
		last_name: '1185 VD',
		username: 'YDA1185'
	},
	{
		id: 653790068,
		first_name: 'Katharina',
		last_name: 'Schüßler',
		username: 'Kaethe12345'
	},
	{
		id: 7201648541,
		first_name: 'Sophia Lalita Lakshmi | Embodiment & Tantra Facilitator',
		last_name: null,
		username: 'Swasoultion'
	},
	{
		id: 7848017015,
		first_name: 'Daniela',
		last_name: 'Cooper',
		username: 'danielaengl'
	},
	{
		id: 1722854786,
		first_name: 'Nic',
		last_name: null,
		username: 'nicky3691'
	},
	{
		id: 1728113958,
		first_name: 'Tiago',
		last_name: 'Bento',
		username: null
	},
	{
		id: 7529285345,
		first_name: 'Julia',
		last_name: 'Kosalka',
		username: null
	},
	{
		id: 267477360,
		first_name: 'Steffi',
		last_name: 'Rose',
		username: 'st_rose'
	},
	{
		id: 6544895675,
		first_name: 'Filipe',
		last_name: 'Viegas',
		username: null
	},
	{
		id: 1597341137,
		first_name: 'Alexei',
		last_name: null,
		username: 'lioshahoroshie'
	},
	{
		id: 1106494619,
		first_name: 'Alain',
		last_name: 'Crevoisier',
		username: null
	},
	{
		id: 2088353652,
		first_name: 'Noam',
		last_name: 'Chadash',
		username: null
	},
	{
		id: 5793610935,
		first_name: 'Cay',
		last_name: 'Chandler',
		username: null
	},
	{
		id: 1598039006,
		first_name: 'Stijn',
		last_name: null,
		username: 'daotempo'
	},
	{
		id: 1105259048,
		first_name: 'Britta',
		last_name: null,
		username: null
	},
	{
		id: 1729328202,
		first_name: 'Shany',
		last_name: 'Rim',
		username: 'Channa1284'
	},
	{
		id: 5660008534,
		first_name: 'Sophia Lalita Lakshmi | Mystical Tantrika for Awaken Kundalini',
		last_name: '- SWA Soultions',
		username: 'swa_soultions'
	},
	{
		id: 2094824212,
		first_name: 'Silja',
		last_name: null,
		username: null
	},
	{
		id: 5435074351,
		first_name: 'Sofia',
		last_name: 'Ayla Atiya',
		username: 'sofia_Atiya'
	},
	{
		id: 1485019080,
		first_name: 'tobi',
		last_name: '/ heart of lion',
		username: 'tobiasleonhardt'
	},
	{
		id: 6725889580,
		first_name: 'Shashi',
		last_name: 'Solluna',
		username: 'Shashisollunalove'
	},
	{
		id: 800977319,
		first_name: 'Anne-Madeleine',
		last_name: null,
		username: 'annemadeleine222'
	},
	{
		id: 1013139368,
		first_name: 'Florian',
		last_name: 'Meise',
		username: 'FlorianMeise'
	},
	{
		id: 1176374405,
		first_name: 'Marina',
		last_name: 'Hamam',
		username: null
	},
	{
		id: 438105537,
		first_name: 'Antonia',
		last_name: null,
		username: 'AntoniaMoe'
	},
	{
		id: 924615587,
		first_name: 'Jenny',
		last_name: 'Jessen',
		username: 'jennyjessen'
	},
	{
		id: 529444898,
		first_name: 'LoveFirst',
		last_name: 'ThenLife',
		username: 'lovefirstthenlife'
	},
	{
		id: 1349813560,
		first_name: 'Katherine',
		last_name: 'Moore',
		username: 'Om_Shanti_109'
	},
	{
		id: 1549177800,
		first_name: 'Gaits',
		last_name: null,
		username: null
	},
	{
		id: 6333759367,
		first_name: 'Sanne',
		last_name: 'Feitsma',
		username: null
	},
	{
		id: 1225434394,
		first_name: 'Sekou',
		last_name: 'Cooke',
		username: 'sekoucooke'
	},
	{
		id: 7543864538,
		first_name: 'Henninge',
		last_name: 'Bie',
		username: null
	},
	{
		id: 1005167024,
		first_name: 'Jamila',
		last_name: 'von Carnap',
		username: null
	},
	{
		id: 1691424719,
		first_name: 'Pippa',
		last_name: 'Moss',
		username: null
	},
	{
		id: 1284980546,
		first_name: 'Marcelo',
		last_name: 'Bohrer',
		username: 'marcelobohrer'
	},
	{
		id: 5555274659,
		first_name: 'Penny Lane',
		last_name: null,
		username: 'pennylane_ontheroad'
	},
	{
		id: 1953311204,
		first_name: 'Marge',
		last_name: 'Daien Oppliger',
		username: 'margedaien'
	},
	{
		id: 5949661291,
		first_name: 'Fred',
		last_name: null,
		username: null
	},
	{
		id: 7128819855,
		first_name: 'Fran 🌈',
		last_name: 'Caye',
		username: 'francaye'
	},
	{
		id: 1405409693,
		first_name: 'Josh V',
		last_name: 'Roberts',
		username: 'joshvroberts'
	},
	{
		id: 7673348953,
		first_name: 'Maryse',
		last_name: 'Mathys',
		username: null
	},
	{
		id: 1855136798,
		first_name: 'Vincent',
		last_name: 'Fournier',
		username: null
	},
	{
		id: 1195698620,
		first_name: 'maat',
		last_name: null,
		username: 'maat44'
	},
	{
		id: 1839614058,
		first_name: 'Meli',
		last_name: null,
		username: null
	}
];

export const getUsers = query(() => {
	return users;
});
