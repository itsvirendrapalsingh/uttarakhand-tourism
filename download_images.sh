#!/bin/bash

# Create directories if they don't exist
mkdir -p images/heroes
mkdir -p images/destinations
mkdir -p images/gallery

# Function to download image
download_image() {
    url=$1
    output_path=$2
    
    if [ -f "$output_path" ]; then
        echo "File already exists: $output_path"
    else
        echo "Downloading $url to $output_path"
        curl -L "$url" -o "$output_path" --retry 3
        
        if [ $? -eq 0 ] && [ -s "$output_path" ]; then
            echo "Successfully downloaded: $output_path"
        else
            echo "Failed to download: $output_path"
            rm -f "$output_path"  # Remove empty file if download failed
        fi
    fi
}

# Hero Images - Using authentic Uttarakhand images from Wikimedia Commons and public domain sources
download_image "https://upload.wikimedia.org/wikipedia/commons/3/30/Kedarnath_Temple.jpg" "images/heroes/kedarnath-hero.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/8/85/Badrinath_Temple%2C_Uttarakhand%2C_India.jpg" "images/heroes/badrinath-hero.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/8/85/Gangotri%2C_Uttarkashi%2C_Uttarakhand%2C_India_08.jpg" "images/heroes/gangotri-hero.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/c/c9/Yamunotri_Temple_3.jpg" "images/heroes/yamunotri-hero.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/f/fe/Ganga_Aarti_at_Haridwar.jpg" "images/heroes/contact-hero.jpg"

# Main Overview Images
download_image "https://upload.wikimedia.org/wikipedia/commons/5/5c/Nainital_lake_and_mountains_2.jpg" "images/uttarakhand-overview.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/f/f1/Uttarakhand_Main_Tourist_Map.jpg" "images/uttarakhand-overview_1.jpg"

# Destination Images
download_image "https://upload.wikimedia.org/wikipedia/commons/d/d7/Nainital_panaroma.jpg" "images/destinations/nainital.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/3/3f/Naini_Lake_from_Eco_Cave_Garden.jpg" "images/destinations/nainital-large.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/c/cf/Mall_Road%2C_Mussoorie.jpg" "images/destinations/mussoorie.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/9/9a/Ganga_river_in_Rishikesh.jpg" "images/destinations/rishikesh.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/7/77/Ram_Jhula%2C_Rishikesh.jpg" "images/destinations/rishikesh-large.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/3/30/Kedarnath_Temple.jpg" "images/destinations/kedarnath.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/6/66/Valley_of_flowers.JPG" "images/destinations/valley-of-flowers.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/6/69/A_tigress_at_Jim_Corbett_National_Park.jpg" "images/destinations/jim-corbett.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/6/6d/Tungnath_Temple.jpg" "images/destinations/chopta.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/2/21/Kausani_Sunset.JPG" "images/destinations/kausani.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/5/5e/Ranikhet_-_Chaubatia_Gardens.jpg" "images/destinations/ranikhet.jpg"

# Planning-related images
download_image "https://upload.wikimedia.org/wikipedia/commons/a/a5/Uttarakhand_Snow_Covered_Peaks.jpg" "images/destinations/seasons-uttarakhand.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/f/f2/Mountain_Roads_of_Uttarakhand.jpg" "images/destinations/transport-uttarakhand.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/9/91/Luxury_Hotel_in_Uttarakhand.jpg" "images/destinations/accommodations.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/4/44/Local_food_in_Uttarakhand.jpg" "images/destinations/local-food.jpg"

# Gallery Images - Mountains
download_image "https://upload.wikimedia.org/wikipedia/commons/e/e8/Nanda_Devi_from_Auli.jpg" "images/gallery/nanda-devi.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/7/73/Trishul_peak.jpg" "images/gallery/trishul-peak.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/6/69/Auli_Skiing_slopes.jpg" "images/gallery/auli-mountains.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/5/50/Panchachuli_peaks.jpg" "images/gallery/panchachuli.jpg"

# Gallery Images - Temples
download_image "https://upload.wikimedia.org/wikipedia/commons/3/30/Kedarnath_Temple.jpg" "images/gallery/kedarnath-temple.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/8/85/Badrinath_Temple%2C_Uttarakhand%2C_India.jpg" "images/gallery/badrinath-temple.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/5/5c/Rishikesh-Temple.jpg" "images/gallery/rishikesh-temple.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/f/fe/Ganga_Aarti_at_Haridwar.jpg" "images/gallery/ganga-aarti.jpg"

# Gallery Images - Lakes
download_image "https://upload.wikimedia.org/wikipedia/commons/5/5c/Nainital_lake_and_mountains_2.jpg" "images/gallery/naini-lake.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/a/aa/Bhimtal_Lake.jpg" "images/gallery/bhimtal.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/4/45/Sattal_Lake.jpg" "images/gallery/sattal.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/4/4a/Khurpatal_Lake.jpg" "images/gallery/khurpatal.jpg"

# Gallery Images - Wildlife
download_image "https://upload.wikimedia.org/wikipedia/commons/6/69/A_tigress_at_Jim_Corbett_National_Park.jpg" "images/gallery/tiger-corbett.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/8/84/Elephant_at_Jim_Corbett.jpg" "images/gallery/elephant-corbett.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/a/a3/Corbett_Leopard.jpg" "images/gallery/leopard.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/6/60/Himalayan_Monal_in_Uttarakhand.jpg" "images/gallery/himalayan-birds.jpg"

# Gallery Images - Culture
download_image "https://upload.wikimedia.org/wikipedia/commons/3/30/Uttarakhand_Local_Festival.jpg" "images/gallery/local-festival.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/d/d9/Uttarakhand_Folk_Dance.jpg" "images/gallery/folk-dance.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/9/95/Uttarakhand_Cuisine.jpg" "images/gallery/local-cuisine.jpg"
download_image "https://upload.wikimedia.org/wikipedia/commons/5/59/Village_Life_Uttarakhand.jpg" "images/gallery/village-life.jpg"

echo "Image download process complete!" 