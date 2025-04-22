#!/usr/bin/env python3
import os
from PIL import Image, ImageDraw, ImageFont

# Create directories
directories = [
    'images/heroes',
    'images/destinations',
    'images/gallery'
]

for directory in directories:
    os.makedirs(directory, exist_ok=True)

# Function to create a placeholder image
def create_placeholder(path, width, height, color, text):
    img = Image.new('RGB', (width, height), color)
    draw = ImageDraw.Draw(img)
    
    # Try to use a simple font (if available)
    try:
        font = ImageFont.truetype("Arial", 30)
    except:
        font = ImageFont.load_default()
    
    # Draw a border
    border_width = 10
    draw.rectangle(
        [(border_width, border_width), (width - border_width, height - border_width)],
        outline=(255, 255, 255),
        width=3
    )
    
    # Calculate text position
    text_width, text_height = draw.textsize(text, font=font) if hasattr(draw, 'textsize') else (200, 30)
    position = ((width - text_width) // 2, (height - text_height) // 2)
    
    # Draw text
    draw.text(position, text, fill=(255, 255, 255), font=font)
    
    # Save image
    img.save(path)
    print(f"Created: {path}")

# Hero images - 1200x500 pixels
hero_images = [
    ('images/heroes/kedarnath-hero.jpg', (70, 120, 180), 'Kedarnath Hero'),
    ('images/heroes/destinations-hero.jpg', (90, 140, 200), 'Destinations Hero'),
    ('images/heroes/gallery-hero.jpg', (110, 160, 220), 'Gallery Hero'),
    ('images/heroes/planning-hero.jpg', (130, 180, 240), 'Planning Hero'),
    ('images/heroes/contact-hero.jpg', (150, 200, 255), 'Contact Hero')
]

for path, color, text in hero_images:
    create_placeholder(path, 1200, 500, color, text)

# Destination images - 800x600 pixels
destination_images = [
    ('images/destinations/nainital.jpg', (40, 130, 90), 'Nainital'),
    ('images/destinations/nainital-large.jpg', (40, 130, 90), 'Nainital Large'),
    ('images/destinations/mussoorie.jpg', (50, 140, 100), 'Mussoorie'),
    ('images/destinations/rishikesh.jpg', (60, 150, 110), 'Rishikesh'),
    ('images/destinations/rishikesh-large.jpg', (60, 150, 110), 'Rishikesh Large'),
    ('images/destinations/kedarnath.jpg', (70, 160, 120), 'Kedarnath'),
    ('images/destinations/valley-of-flowers.jpg', (80, 170, 130), 'Valley of Flowers'),
    ('images/destinations/jim-corbett.jpg', (90, 180, 140), 'Jim Corbett'),
    ('images/destinations/chopta.jpg', (100, 190, 150), 'Chopta'),
    ('images/destinations/kausani.jpg', (110, 200, 160), 'Kausani'),
    ('images/destinations/ranikhet.jpg', (120, 210, 170), 'Ranikhet'),
    ('images/destinations/seasons-uttarakhand.jpg', (130, 220, 180), 'Seasons'),
    ('images/destinations/transport-uttarakhand.jpg', (140, 230, 190), 'Transport'),
    ('images/destinations/accommodations.jpg', (150, 240, 200), 'Accommodations'),
    ('images/destinations/local-food.jpg', (160, 250, 210), 'Local Food'),
    ('images/uttarakhand-overview.jpg', (170, 260, 220), 'Uttarakhand Overview')
]

for path, color, text in destination_images:
    create_placeholder(path, 800, 600, color, text)

# Gallery images - 600x400 pixels
gallery_images = [
    # Mountains
    ('images/gallery/nanda-devi.jpg', (50, 80, 140), 'Nanda Devi'),
    ('images/gallery/trishul-peak.jpg', (60, 90, 150), 'Trishul Peak'),
    ('images/gallery/auli-mountains.jpg', (70, 100, 160), 'Auli Mountains'),
    ('images/gallery/panchachuli.jpg', (80, 110, 170), 'Panchachuli'),
    
    # Temples
    ('images/gallery/kedarnath-temple.jpg', (140, 50, 80), 'Kedarnath Temple'),
    ('images/gallery/badrinath-temple.jpg', (150, 60, 90), 'Badrinath Temple'),
    ('images/gallery/rishikesh-temple.jpg', (160, 70, 100), 'Rishikesh Temple'),
    ('images/gallery/ganga-aarti.jpg', (170, 80, 110), 'Ganga Aarti'),
    
    # Lakes
    ('images/gallery/naini-lake.jpg', (50, 140, 80), 'Naini Lake'),
    ('images/gallery/bhimtal.jpg', (60, 150, 90), 'Bhimtal'),
    ('images/gallery/sattal.jpg', (70, 160, 100), 'Sattal'),
    ('images/gallery/khurpatal.jpg', (80, 170, 110), 'Khurpatal'),
    
    # Wildlife
    ('images/gallery/tiger-corbett.jpg', (140, 80, 50), 'Tiger at Corbett'),
    ('images/gallery/elephant-corbett.jpg', (150, 90, 60), 'Elephant at Corbett'),
    ('images/gallery/himalayan-birds.jpg', (160, 100, 70), 'Himalayan Birds'),
    ('images/gallery/leopard.jpg', (170, 110, 80), 'Leopard'),
    
    # Culture
    ('images/gallery/local-festival.jpg', (80, 50, 140), 'Local Festival'),
    ('images/gallery/folk-dance.jpg', (90, 60, 150), 'Folk Dance'),
    ('images/gallery/local-cuisine.jpg', (100, 70, 160), 'Local Cuisine'),
    ('images/gallery/village-life.jpg', (110, 80, 170), 'Village Life')
]

for path, color, text in gallery_images:
    create_placeholder(path, 600, 400, color, text)

print("All placeholder images created successfully!") 