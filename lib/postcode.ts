export interface PostcodeResult {
  postcode: string;
  eastings: number;
  northings: number;
  latitude: number;
  longitude: number;
  district: string;
  parish: string;
}

// Built-in offline dictionary of common Kent & Out-of-County reference postcodes for instant lookup
const LOCAL_POSTCODE_CACHE: Record<string, PostcodeResult> = {
  'TN131AA': { postcode: 'TN13 1AA', eastings: 553000, northings: 154500, latitude: 51.270, longitude: 0.190, district: 'Sevenoaks', parish: 'Sevenoaks' },
  'TN133SL': { postcode: 'TN13 3SL', eastings: 554043, northings: 156494, latitude: 51.286754, longitude: 0.207635, district: 'Sevenoaks', parish: 'Sevenoaks' },
  'TN49PG': { postcode: 'TN4 9PG', eastings: 558264, northings: 140611, latitude: 51.14289, longitude: 0.261111, district: 'Tunbridge Wells', parish: 'Tunbridge Wells' },
  'TN92PN': { postcode: 'TN9 2PN', eastings: 558360, northings: 145647, latitude: 51.188112, longitude: 0.264699, district: 'Tonbridge & Malling', parish: 'Tonbridge' },
  'DA12HW': { postcode: 'DA1 2HW', eastings: 553369, northings: 174163, latitude: 51.445694, longitude: 0.205594, district: 'Dartford', parish: 'Dartford' },
  'DA27DA': { postcode: 'DA2 7DA', eastings: 552660, northings: 172186, latitude: 51.428122, longitude: 0.194547, district: 'Dartford', parish: 'Wilmington' },
  'ME145DR': { postcode: 'ME14 5DR', eastings: 576934, northings: 155822, latitude: 51.274073, longitude: 0.535242, district: 'Maidstone', parish: 'Maidstone' },
  'ME157BT': { postcode: 'ME15 7BT', eastings: 576678, northings: 154844, latitude: 51.265367, longitude: 0.531094, district: 'Maidstone', parish: 'Maidstone' },
  'ME160SF': { postcode: 'ME16 0SF', eastings: 575290, northings: 156399, latitude: 51.279764, longitude: 0.51198, district: 'Maidstone', parish: 'Maidstone' },
  'ME137BQ': { postcode: 'ME13 7BQ', eastings: 601923, northings: 161598, latitude: 51.317648, longitude: 0.8963, district: 'Swale', parish: 'Faversham' },
  'ME104DB': { postcode: 'ME10 4DB', eastings: 590580, northings: 163359, latitude: 51.337372, longitude: 0.734671, district: 'Swale', parish: 'Sittingbourne' },
  'CT11PH': { postcode: 'CT1 1PH', eastings: 615709, northings: 157599, latitude: 51.276688, longitude: 1.091418, district: 'Canterbury', parish: 'Canterbury' },
  'CT47AS': { postcode: 'CT4 7AS', eastings: 615323, northings: 155828, latitude: 51.260933, longitude: 1.084827, district: 'Canterbury', parish: 'Canterbury' },
  'TN248UD': { postcode: 'TN24 8UD', eastings: 600384, northings: 143340, latitude: 51.154221, longitude: 0.864038, district: 'Ashford', parish: 'Ashford' },
  'CT203RB': { postcode: 'CT20 3RB', eastings: 620830, northings: 135550, latitude: 51.076764, longitude: 1.15119, district: 'Folkestone & Hythe', parish: 'Folkestone' },
  'CT170DQ': { postcode: 'CT17 0DQ', eastings: 630352, northings: 141716, latitude: 51.128382, longitude: 1.290821, district: 'Dover', parish: 'Dover' },
  'CT117PS': { postcode: 'CT11 7PS', eastings: 638045, northings: 165250, latitude: 51.33648, longitude: 1.416181, district: 'Thanet', parish: 'Ramsgate' },
  'TN173JD': { postcode: 'TN17 3JD', eastings: 577829, northings: 136133, latitude: 51.096926, longitude: 0.538321, district: 'Tunbridge Wells', parish: 'Cranbrook' },
  'DA122PR': { postcode: 'DA12 2PR', eastings: 565789, northings: 173593, latitude: 51.437077, longitude: 0.383891, district: 'Gravesham', parish: 'Gravesend' },
  'BR11AA': { postcode: 'BR1 1AA', eastings: 540500, northings: 169500, latitude: 51.405, longitude: 0.021, district: 'Bromley', parish: 'Bromley' },
  'BR11XX': { postcode: 'BR1 1XX', eastings: 540500, northings: 169500, latitude: 51.405, longitude: 0.021, district: 'Bromley', parish: 'Bromley' },
  'DA12XX': { postcode: 'DA1 2XX', eastings: 553300, northings: 174000, latitude: 51.445, longitude: 0.205, district: 'Dartford', parish: 'Dartford' },
  'TN131XX': { postcode: 'TN13 1XX', eastings: 553000, northings: 154500, latitude: 51.270, longitude: 0.190, district: 'Sevenoaks', parish: 'Sevenoaks' },
  'ME141XX': { postcode: 'ME14 1XX', eastings: 576000, northings: 156000, latitude: 51.275, longitude: 0.520, district: 'Maidstone', parish: 'Maidstone' }
};

export async function lookupPostcode(postcode: string): Promise<PostcodeResult | null> {
  const clean = postcode.replace(/\s+/g, '').toUpperCase();
  if (!clean || clean.length < 3) return null;

  // Check local offline dictionary first
  if (LOCAL_POSTCODE_CACHE[clean]) {
    return LOCAL_POSTCODE_CACHE[clean];
  }

  // Prefix check for generic outcodes like TN13, DA1, BR1
  for (const [key, val] of Object.entries(LOCAL_POSTCODE_CACHE)) {
    if (clean === key.slice(0, 4) || clean.startsWith(key.slice(0, 4))) {
      return {
        ...val,
        postcode: postcode.toUpperCase()
      };
    }
  }

  try {
    const res = await fetch(`https://api.postcodes.io/postcodes/${clean}`);
    if (!res.ok) {
      // Try outcode lookup if full postcode fails
      const outcode = clean.slice(0, clean.length >= 5 ? clean.length - 3 : clean.length);
      const outcodeRes = await fetch(`https://api.postcodes.io/outcodes/${outcode}`);
      if (outcodeRes.ok) {
        const outData = await outcodeRes.json();
        if (outData.result) {
          const r = outData.result;
          return {
            postcode: postcode.toUpperCase(),
            eastings: r.eastings || 550000,
            northings: r.northings || 155000,
            latitude: r.latitude,
            longitude: r.longitude,
            district: r.admin_district?.[0] || 'Kent',
            parish: r.parish?.[0] || r.admin_district?.[0] || 'Kent'
          };
        }
      }
      return null;
    }

    const data = await res.json();
    if (data.status === 200 && data.result) {
      const r = data.result;
      const resObj: PostcodeResult = {
        postcode: r.postcode,
        eastings: r.eastings,
        northings: r.northings,
        latitude: r.latitude,
        longitude: r.longitude,
        district: r.admin_district || 'Kent',
        parish: r.parish || r.admin_district || 'Kent'
      };
      // Cache result
      LOCAL_POSTCODE_CACHE[clean] = resObj;
      return resObj;
    }
  } catch (err) {
    console.warn('Postcode lookup error:', err);
  }

  return null;
}
