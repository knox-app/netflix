/**
 * genres.js
 * Centralized Genres Catalog & Helpers for My Space
 * URLs have `,w_640` stripped out for full quality images.
 */

export const ALL_GENRES_MAP = {
  "Romance": {
    name: "Romance",
    image: "https://img10.hotstar.com/image/upload/f_auto,q_90/sources/r1/cms/prod/1112/1750239101112-a"
  },
  "Drama": {
    name: "Drama",
    image: "https://img10.hotstar.com/image/upload/f_auto,q_90/sources/r1/cms/prod/5285/1535285-a-88035ca1ae69"
  },
  "Family": {
    name: "Family",
    image: "https://img10.hotstar.com/image/upload/f_auto,q_90/sources/r1/cms/prod/5284/1535284-a-656c6b45a905"
  },
  "Comedy": {
    name: "Comedy",
    image: "https://img10.hotstar.com/image/upload/f_auto,q_90/sources/r1/cms/prod/5292/1535292-a-5739f9c84b63"
  },
  "Reality": {
    name: "Reality",
    image: "https://img10.hotstar.com/image/upload/f_auto,q_90/sources/r1/cms/prod/5264/1535264-a-9e7871687c76"
  },
  "Mythology": {
    name: "Mythology",
    image: "https://img10.hotstar.com/image/upload/f_auto,q_90/sources/r1/cms/prod/5267/1535267-a-3cae422b372e"
  },
  "Crime": {
    name: "Crime",
    image: "https://img10.hotstar.com/image/upload/f_auto,q_90/sources/r1/cms/prod/5288/1535288-a-690bac400aa1"
  },
  "Food": {
    name: "Food",
    image: "https://img10.hotstar.com/image/upload/f_auto,q_90/sources/r1/cms/prod/5281/1535281-a-b56dc39e5bb7"
  },
  "Action": {
    name: "Action",
    image: "https://img10.hotstar.com/image/upload/f_auto,q_90/sources/r1/cms/prod/5302/1535302-a-e90748391e0d"
  },
  "Talk show": {
    name: "Talk show",
    image: "https://img10.hotstar.com/image/upload/f_auto,q_90/sources/r1/cms/prod/5250/1535250-a-b320bf06458d"
  },
  "Lifestyle": {
    name: "Lifestyle",
    image: "https://img10.hotstar.com/image/upload/f_auto,q_90/sources/r1/cms/prod/5274/1535274-a-5532b8285ed1"
  },
  "Teen": {
    name: "Teen",
    image: "https://img10.hotstar.com/image/upload/f_auto,q_90/sources/r1/cms/prod/5248/1535248-a-35ccd1ea9ec0"
  },
  "Awards": {
    name: "Awards",
    image: "https://img10.hotstar.com/image/upload/f_auto,q_90/sources/r1/cms/prod/5295/1535295-a-6a74b60243b1"
  },
  "Biopic": {
    name: "Biopic",
    image: "https://img10.hotstar.com/image/upload/f_auto,q_90/sources/r1/cms/prod/8589/1750239188589-a"
  },
  "Documantery": {
    name: "Documantery",
    image: "https://img10.hotstar.com/image/upload/f_auto,q_90/sources/r1/cms/prod/5286/1535286-a-f282f00643b5"
  },
  "Travel": {
    name: "Travel",
    image: "https://img10.hotstar.com/image/upload/f_auto,q_90/sources/r1/cms/prod/5245/1535245-a-90839834c474"
  },
  "Horror": {
    name: "Horror",
    image: "https://img10.hotstar.com/image/upload/f_auto,q_90/sources/r1/cms/prod/5279/1535279-a-c92b487cb711"
  },
  "Kids": {
    name: "Kids",
    image: "https://img10.hotstar.com/image/upload/f_auto,q_90/sources/r1/cms/prod/5278/1535278-a-e9dbbe66922b"
  },
  "Thriller": {
    name: "Thriller",
    image: "https://img10.hotstar.com/image/upload/f_auto,q_90/sources/r1/cms/prod/5246/1535246-a-27373cc1a222"
  },
  "Adventure": {
    name: "Adventure",
    image: "https://img10.hotstar.com/image/upload/f_auto,q_90/sources/r1/cms/prod/5301/1535301-a-9bb68bcd147c"
  },
  "Animal & Nature": {
    name: "Animal & Nature",
    image: "https://img10.hotstar.com/image/upload/f_auto,q_90/sources/r1/cms/prod/8373/1608373-a-251c2eee021b"
  },
  "Concert Film": {
    name: "Concert Film",
    image: "https://img10.hotstar.com/image/upload/f_auto,q_90/sources/r1/cms/prod/93/1750239110093-a"
  },
  "Animation": {
    name: "Animation",
    image: "https://img10.hotstar.com/image/upload/f_auto,q_90/sources/r1/cms/prod/5299/1535299-a-e6296badeb14"
  },
  "Anime": {
    name: "Anime",
    image: "https://img10.hotstar.com/image/upload/f_auto,q_90/sources/r1/cms/prod/2025/1750239042025-a"
  },
  "Devotional & Spiritual": {
    name: "Devotional & Spiritual",
    image: "https://img10.hotstar.com/image/upload/f_auto,q_90/sources/r1/cms/prod/8815/1608815-a-7d866bb51198"
  },
  "Fantasy": {
    name: "Fantasy",
    image: "https://img10.hotstar.com/image/upload/f_auto,q_90/sources/r1/cms/prod/5282/1535282-a-ae97739962dc"
  },
  "Historical": {
    name: "Historical",
    image: "https://img10.hotstar.com/image/upload/f_auto,q_90/sources/r1/cms/prod/5280/1535280-a-a1d64ccd7457"
  },
  "Musical": {
    name: "Musical",
    image: "https://img10.hotstar.com/image/upload/f_auto,q_90/sources/r1/cms/prod/5270/1535270-a-6a85b09721ab"
  },
  "Mystery": {
    name: "Mystery",
    image: "https://img10.hotstar.com/image/upload/f_auto,q_90/sources/r1/cms/prod/5269/1535269-a-e0ed0b72ebe7"
  },
  "Sci-Fi": {
    name: "Sci-Fi",
    image: "https://img10.hotstar.com/image/upload/f_auto,q_90/sources/r1/cms/prod/5259/1535259-a-6e0b7daffb29"
  },
  "Princess": {
    name: "Princess",
    image: "https://static0.moviewebimages.com/wordpress/wp-content/uploads/2026/05/untitled-design-30-1.jpg?h=900&fit=crop"
  },
  "Superhero": {
    name: "Superhero",
    image: "https://img10.hotstar.com/image/upload/f_auto,q_90/sources/r1/cms/prod/8364/1538364-a-a3b574f36633"
  }
};

/**
 * Kids or Under 13+ List (U / U/A 7+)
 */
export const KIDS_GENRE_NAMES = [
  "Sci-Fi", "Adventure", "Animation", "Kids", "Fantasy", "Action", 
  "Drama", "Family", "Comedy", "Mythology", "Animal & Nature", "Superhero", "Princess"
];

/**
 * 13+ and Greater List (U/A 13+, U/A 16+, U/A 18+)
 */
export const ADULT_GENRE_NAMES = [
  "Romance", "Drama", "Family", "Reality", "Teen", "Comedy", "Mythology", 
  "Crime", "Food", "Action", "Talk show", "Lifestyle", "Awards", "Sci-Fi", 
  "Biopic", "Documantery", "Travel", "Horror", "Kids", "Thriller", "Adventure", 
  "Animation", "Anime", "Superhero", "Princess", "Mystery", "Musical", "Devotional & Spiritual"
];

/**
 * Returns an array of genre objects { name, image, link } based on age rating tier
 * @param {number} tier - 1: U, 2: U/A 7+, 3: U/A 13+, 4: U/A 16+, 5: U/A 18+
 */
export function getGenresByTier(tier = 1) {
  const isKidsTier = tier <= 2;
  const targetNames = isKidsTier ? KIDS_GENRE_NAMES : ADULT_GENRE_NAMES;

  return targetNames.map(name => {
    const item = ALL_GENRES_MAP[name] || { name, image: "" };
    return {
      name: item.name,
      image: item.image,
      link: `https://knox-app.github.io/netflix/genres#${encodeURIComponent(item.name.toLowerCase())}`
    };
  });
}
