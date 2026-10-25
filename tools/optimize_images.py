"""Resize the real photos in images/ to web sizes and write content/images.json.
Run: python3 tools/optimize_images.py   (needs Pillow). Placeholder files (<100 KB) are skipped.
Credits are inferred from file names; where the name carries none the credit is left empty and must be confirmed."""
import json, os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# id: (source, alt, theme, credit)
SRC = {
 'overview':  ('images/uttarakhand-overview.jpg', 'Snow-capped Himalayan peak above forested valleys under a blue sky', 'mountains', ''),
 'camp-snow': ('images/destinations/accommodations.jpg', 'Colourful tents pitched on a snowy Himalayan ridge below a snow peak', 'trekking', ''),
 'pines-peaks': ('images/destinations/adventure.jpg', 'Snow-covered peaks seen through pine trees under a blue sky', 'mountains', ''),
 'snow-ridge': ('images/destinations/auli.jpg', 'Snowy ridge in the foreground with a Himalayan range fading into haze', 'mountains', ''),
 'dog-peaks': ('images/destinations/jim-corbett.jpg', 'A golden dog resting on a hillside with snow peaks behind', 'landscape', ''),
 'rishikesh-dance': ('images/destinations/food.jpg', 'A woman in a turquoise sari dancing on a riverbank in front of a temple complex in Rishikesh', 'culture', ''),
 'rishikesh-yoga': ('images/destinations/pexels-yoga-course-india-932671557-20035531.jpg', 'Yoga practice on the Ganga bank with the Rishikesh temple complex behind', 'culture', 'Yoga Course India / Pexels'),
 'ridge-haze': ('images/destinations/pexels-k-s-aravinda-kashyap-86628820-31580155.jpg', 'Snowy ridgeline and valley in blue haze', 'mountains', 'K S Aravinda Kashyap / Pexels'),
 'snow-pines': ('images/destinations/pexels-k-s-aravinda-kashyap-86628820-31580156.jpg', 'Snow-dusted pine forest slope under a bright sky', 'trekking', 'K S Aravinda Kashyap / Pexels'),
 'snow-bowl': ('images/destinations/pexels-k-s-aravinda-kashyap-86628820-31580158.jpg', 'Snow-covered peaks and a wide snow bowl', 'mountains', 'K S Aravinda Kashyap / Pexels'),
 'tents-blue': ('images/destinations/pexels-k-s-aravinda-kashyap-86628820-31580160.jpg', 'Orange and red tents at a trek campsite under a deep blue sky', 'trekking', 'K S Aravinda Kashyap / Pexels'),
 'snow-slope': ('images/destinations/pexels-k-s-aravinda-kashyap-86628820-31580163.jpg', 'A wide, unbroken snow slope on a high Himalayan ridge', 'mountains', 'K S Aravinda Kashyap / Pexels'),
 'forest-range': ('images/destinations/pexels-k-s-aravinda-kashyap-86628820-31580169.jpg', 'Pine forest ridge with a long Himalayan snow range behind', 'mountains', 'K S Aravinda Kashyap / Pexels'),
 'yoga-studio': ('images/destinations/pexels-kundalini-yoga-ashram-324305954-14989453.jpg', 'A group practising yoga postures in a studio', 'culture', 'Kundalini Yoga Ashram / Pexels'),
 'green-hills': ('images/destinations/pexels-shaurya-malik-322465-954646.jpg', 'Green forested hills and a hazy valley at sunset', 'landscape', 'Shaurya Malik / Pexels'),
 'sadhu': ('images/destinations/pexels-soubhagya23-18915949.jpg', 'A sadhu in an ornate patterned turban', 'culture', 'Soubhagya23 / Pexels'),
 'peaks-clouds': ('images/destinations/saiteja-varma-cK7k1s96zzQ-unsplash.jpg', 'Rugged snow peaks under dramatic clouds', 'mountains', 'Saiteja Varma / Unsplash'),
 'trekker-ridge': ('images/destinations/saiteja-varma-zliKrsociwo-unsplash.jpg', 'A trekker with a blue backpack on a grassy ridge facing a snow range', 'trekking', 'Saiteja Varma / Unsplash'),
 'village-terraces': ('images/destinations/vivek-lnXFFBFuISo-unsplash.jpg', 'Hill village and green terraced fields under low cloud', 'landscape', 'Vivek / Unsplash'),
}
out = {}
os.makedirs(os.path.join(ROOT, 'images/opt'), exist_ok=True)
for k, (src, alt, theme, credit) in SRC.items():
    im = Image.open(os.path.join(ROOT, src)).convert('RGB')
    rec = {'alt': alt, 'theme': theme, 'credit': credit, 'src': src, 'v': []}
    for w in (640, 1600):
        t = im.copy(); t.thumbnail((w, w * 2))
        if t.width > w: t = t.resize((w, round(t.height * w / t.width)))
        rel = f'images/opt/{k}-{w}.jpg'
        t.save(os.path.join(ROOT, rel), quality=78, optimize=True, progressive=True)
        rec['v'].append({'w': t.width, 'h': t.height, 'path': rel})
    out[k] = rec
json.dump(out, open(os.path.join(ROOT, 'content/images.json'), 'w'), indent=1)
print(len(out), 'images;', sum(os.path.getsize(os.path.join(ROOT, v['path'])) for r in out.values() for v in r['v']) // 1024, 'KB total')
