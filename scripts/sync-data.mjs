import { countries } from 'countries-list';
import { mkdir, writeFile, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
// 193 UN members + Holy See and Palestine. Geography follows Countries List.
const codes = `AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI CV KH CM CA CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG MK NO OM PK PW PA PG PY PE PH PL PT QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA SS ES LK SD SR SE CH SY TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW PS`.split(' ');
const names = new Intl.DisplayNames(['vi'], { type: 'region' });
await mkdir('public/flags', { recursive: true });
await mkdir('src/data', { recursive: true });
await mkdir('docs/third-party', { recursive: true });
const data = codes.map(code => {
  const country = countries[code];
  if (!country) throw new Error(`Missing ${code}`);
  return { code, name: names.of(code), nameEn: country.name, continent: country.continent, capital: country.capital };
});
let done = 0;
const hashes = {};
for (let i = 0; i < data.length; i += 8) {
  await Promise.all(data.slice(i, i + 8).map(async ({ code }) => {
    const response = await fetch(`https://flagcdn.com/${code.toLowerCase()}.svg`);
    if (!response.ok) throw new Error(`${code}: ${response.status}`);
    const svg = await response.text();
    if (!svg.includes('<svg') || /<script[\s>]/i.test(svg)) throw new Error(`Invalid SVG ${code}`);
    await writeFile(`public/flags/${code.toLowerCase()}.svg`, svg);
    hashes[code] = createHash('sha256').update(svg).digest('hex');
    done++;
  }));
  console.log(`Downloaded ${done}/${data.length}`);
}
await writeFile('src/data/countries.json', JSON.stringify(data, null, 2) + '\n');
await writeFile('docs/third-party/flag-manifest.json', JSON.stringify({ retrievedAt: new Date().toISOString(), source: 'https://flagcdn.com', hashes }, null, 2));
await copyFile('node_modules/countries-list/LICENSE', 'docs/third-party/countries-list-LICENSE.txt');
console.log(`Saved ${data.length} countries.`);
