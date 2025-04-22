#!/bin/bash

# Create backup directory
echo "Creating backup of existing images..."
timestamp=$(date +"%Y%m%d%H%M%S")
backup_dir="images_backup_$timestamp"
mkdir -p "$backup_dir"

# Backup existing images if they exist
if [ -d "images" ]; then
  cp -r images/* "$backup_dir"/
  echo "Backed up existing images to $backup_dir"
  
  # Remove existing images
  echo "Removing existing images..."
  rm -rf images/heroes/* images/destinations/* images/gallery/* images/uttarakhand-overview.jpg
fi

# Create directories if they don't exist
mkdir -p images/heroes
mkdir -p images/destinations
mkdir -p images/gallery

# Function to download image
download_image() {
    url=$1
    output_path=$2
    
    echo "Downloading $url to $output_path"
    curl -L "$url" -o "$output_path" --retry 3
    
    if [ $? -eq 0 ] && [ -s "$output_path" ]; then
        echo "Successfully downloaded: $output_path"
    else
        echo "Failed to download: $output_path"
        rm -f "$output_path"  # Remove empty file if download failed
    fi
}

# Hero Images - Authentic Uttarakhand
download_image "https://upload.wikimedia.org/wikipedia/commons/e/e8/Kedarnath_Temple%2C_May_2019.jpg" "images/heroes/kedarnath-hero.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Valley_of_Flowers_National_Park.jpg/1280px-Valley_of_Flowers_National_Park.jpg" "images/heroes/destinations-hero.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Naini_Lake%2C_Nainital.jpg/1280px-Naini_Lake%2C_Nainital.jpg" "images/heroes/gallery-hero.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Chopta_Valley_in_Uttarakhand.jpg/1280px-Chopta_Valley_in_Uttarakhand.jpg" "images/heroes/planning-hero.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Lakshman_Jhula_India.jpg/1280px-Lakshman_Jhula_India.jpg" "images/heroes/contact-hero.jpg"

# Main Overview Image
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Uttarakhand_Overview.jpg/1280px-Uttarakhand_Overview.jpg" "images/uttarakhand-overview.jpg"

# Destination Images - Authentic Uttarakhand
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Naini_Lake%2C_Nainital.jpg/1280px-Naini_Lake%2C_Nainital.jpg" "images/destinations/nainital.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Naini_Lake%2C_Nainital.jpg/1920px-Naini_Lake%2C_Nainital.jpg" "images/destinations/nainital-large.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Mussoorie_hills.jpg/1280px-Mussoorie_hills.jpg" "images/destinations/mussoorie.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Rishikesh_Laxman_Jhula.jpg/1280px-Rishikesh_Laxman_Jhula.jpg" "images/destinations/rishikesh.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Rishikesh_Laxman_Jhula.jpg/1920px-Rishikesh_Laxman_Jhula.jpg" "images/destinations/rishikesh-large.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/e/e8/Kedarnath_Temple%2C_May_2019.jpg" "images/destinations/kedarnath.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Valley_of_Flowers_National_Park.jpg/1280px-Valley_of_Flowers_National_Park.jpg" "images/destinations/valley-of-flowers.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Jim_Corbett_National_Park.jpg/1280px-Jim_Corbett_National_Park.jpg" "images/destinations/jim-corbett.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Chopta_Valley_in_Uttarakhand.jpg/1280px-Chopta_Valley_in_Uttarakhand.jpg" "images/destinations/chopta.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/5/56/Kausani_Village%2C_Uttarakhand.jpg" "images/destinations/kausani.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Ranikhet_view.jpg/1280px-Ranikhet_view.jpg" "images/destinations/ranikhet.jpg"

# Planning-related images - Authentic Uttarakhand
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Uttarakhand_Seasons.jpg/1280px-Uttarakhand_Seasons.jpg" "images/destinations/seasons-uttarakhand.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Uttarakhand_Mountain_Roads.jpg/1280px-Uttarakhand_Mountain_Roads.jpg" "images/destinations/transport-uttarakhand.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Uttarakhand_Traditional_Home.jpg/1280px-Uttarakhand_Traditional_Home.jpg" "images/destinations/accommodations.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Uttarakhand_Local_Cuisine.jpg/1280px-Uttarakhand_Local_Cuisine.jpg" "images/destinations/local-food.jpg"

# Gallery Images - Mountains (Authentic)
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Nanda_Devi.jpg/1280px-Nanda_Devi.jpg" "images/gallery/nanda-devi.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Trishul_Peak.jpg/1280px-Trishul_Peak.jpg" "images/gallery/trishul-peak.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Auli_Skiing.jpg/1280px-Auli_Skiing.jpg" "images/gallery/auli-mountains.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Panchachuli_peaks.jpg/1280px-Panchachuli_peaks.jpg" "images/gallery/panchachuli.jpg"

# Gallery Images - Temples (Authentic)
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Kedarnath_Temple_Uttarakhand.jpg/1280px-Kedarnath_Temple_Uttarakhand.jpg" "images/gallery/kedarnath-temple.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Badrinath_Temple.jpg/1280px-Badrinath_Temple.jpg" "images/gallery/badrinath-temple.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Rishikesh_Temples.jpg/1280px-Rishikesh_Temples.jpg" "images/gallery/rishikesh-temple.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Ganga_Aarti_Rishikesh.jpg/1280px-Ganga_Aarti_Rishikesh.jpg" "images/gallery/ganga-aarti.jpg"

# Gallery Images - Lakes (Authentic)
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Naini_Lake%2C_Nainital.jpg/1280px-Naini_Lake%2C_Nainital.jpg" "images/gallery/naini-lake.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Bhimtal_Lake.jpg/1280px-Bhimtal_Lake.jpg" "images/gallery/bhimtal.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Sattal_Lake.jpg/1280px-Sattal_Lake.jpg" "images/gallery/sattal.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Khurpatal_Lake.jpg/1280px-Khurpatal_Lake.jpg" "images/gallery/khurpatal.jpg"

# Gallery Images - Wildlife (Authentic)
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Tiger_in_Jim_Corbett.jpg/1280px-Tiger_in_Jim_Corbett.jpg" "images/gallery/tiger-corbett.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Elephant_in_Corbett_National_Park.jpg/1280px-Elephant_in_Corbett_National_Park.jpg" "images/gallery/elephant-corbett.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Leopard_in_Uttarakhand.jpg/1280px-Leopard_in_Uttarakhand.jpg" "images/gallery/leopard.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Himalayan_Bird_Uttarakhand.jpg/1280px-Himalayan_Bird_Uttarakhand.jpg" "images/gallery/himalayan-birds.jpg"

# Gallery Images - Culture (Authentic)
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Uttarakhand_Local_Festival.jpg/1280px-Uttarakhand_Local_Festival.jpg" "images/gallery/local-festival.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Uttarakhand_Folk_Dance.jpg/1280px-Uttarakhand_Folk_Dance.jpg" "images/gallery/folk-dance.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Uttarakhand_Local_Cuisine.jpg/1280px-Uttarakhand_Local_Cuisine.jpg" "images/gallery/local-cuisine.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Uttarakhand_Village_Life.jpg/1280px-Uttarakhand_Village_Life.jpg" "images/gallery/village-life.jpg"

echo "Authentic Uttarakhand image download process complete!" 