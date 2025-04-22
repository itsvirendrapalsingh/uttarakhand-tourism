#!/bin/bash

# Function to create directory if it doesn't exist
create_dir_if_not_exists() {
    if [ ! -d "$1" ]; then
        mkdir -p "$1"
        echo "Created directory: $1"
    fi
}

# Create all necessary directories
create_dir_if_not_exists "images"
create_dir_if_not_exists "images/heroes"
create_dir_if_not_exists "images/destinations"
create_dir_if_not_exists "images/gallery"

# Function to download image if it doesn't exist
download_image() {
    local url="$1"
    local destination="$2"
    
    if [ ! -f "$destination" ] || [ $(stat -c%s "$destination") -lt 5000 ]; then
        echo "Downloading: $destination"
        curl -s "$url" -o "$destination"
        
        # Check if download was successful (file exists and size > 5KB)
        if [ -f "$destination" ] && [ $(stat -c%s "$destination") -gt 5000 ]; then
            echo "Successfully downloaded: $destination"
        else
            echo "Failed to download: $destination"
        fi
    else
        echo "File already exists: $destination"
    fi
}

# Download hero images
download_image "https://source.unsplash.com/1600x900/?uttarakhand,mountains" "images/heroes/destinations-hero.jpg"
download_image "https://source.unsplash.com/1600x900/?himalaya,mountains" "images/heroes/gallery-hero.jpg"
download_image "https://source.unsplash.com/1600x900/?hiking,travel" "images/heroes/planning-hero.jpg"
download_image "https://source.unsplash.com/1600x900/?contact,office" "images/heroes/contact-hero.jpg"
download_image "https://source.unsplash.com/1600x900/?badrinath,temple" "images/heroes/badrinath-hero.jpg"
download_image "https://source.unsplash.com/1600x900/?kedarnath,temple" "images/heroes/kedarnath-hero.jpg"
download_image "https://source.unsplash.com/1600x900/?gangotri,himalaya" "images/heroes/gangotri-hero.jpg"
download_image "https://source.unsplash.com/1600x900/?yamunotri,himalaya" "images/heroes/yamunotri-hero.jpg"

# Download destination images
download_image "https://source.unsplash.com/800x600/?nainital,lake" "images/destinations/nainital.jpg"
download_image "https://source.unsplash.com/800x600/?mussoorie,hills" "images/destinations/mussoorie.jpg"
download_image "https://source.unsplash.com/800x600/?rishikesh,river" "images/destinations/rishikesh.jpg"
download_image "https://source.unsplash.com/800x600/?auli,skiing" "images/destinations/auli.jpg"
download_image "https://source.unsplash.com/800x600/?jim,corbett,national,park" "images/destinations/jim-corbett.jpg"
download_image "https://source.unsplash.com/800x600/?chopta,trek" "images/destinations/chopta.jpg"
download_image "https://source.unsplash.com/800x600/?valley,flowers" "images/destinations/valley-of-flowers.jpg"
download_image "https://source.unsplash.com/800x600/?hotel,resort,mountain" "images/destinations/accommodations.jpg"
download_image "https://source.unsplash.com/800x600/?local,food,himalaya" "images/destinations/food.jpg"
download_image "https://source.unsplash.com/800x600/?adventure,hiking" "images/destinations/adventure.jpg"

# Download gallery images
download_image "https://source.unsplash.com/800x600/?auli,snow,mountains" "images/gallery/auli-mountains.jpg"
download_image "https://source.unsplash.com/800x600/?badrinath,temple" "images/gallery/badrinath-temple.jpg"
download_image "https://source.unsplash.com/800x600/?corbett,tiger" "images/gallery/corbett-tiger.jpg"
download_image "https://source.unsplash.com/800x600/?dehradun,city" "images/gallery/dehradun-city.jpg"
download_image "https://source.unsplash.com/800x600/?haridwar,ganga,aarti" "images/gallery/haridwar-ganga-aarti.jpg"
download_image "https://source.unsplash.com/800x600/?kedarnath,temple" "images/gallery/kedarnath-temple.jpg"
download_image "https://source.unsplash.com/800x600/?mussoorie,mall,road" "images/gallery/mussoorie-mall-road.jpg"
download_image "https://source.unsplash.com/800x600/?nainital,lake" "images/gallery/nainital-lake.jpg"
download_image "https://source.unsplash.com/800x600/?rishikesh,rafting" "images/gallery/rishikesh-rafting.jpg"
download_image "https://source.unsplash.com/800x600/?valley,flowers" "images/gallery/valley-of-flowers.jpg"
download_image "https://source.unsplash.com/800x600/?uttarakhand,culture" "images/gallery/uttarakhand-culture.jpg"
download_image "https://source.unsplash.com/800x600/?uttarakhand,festival" "images/gallery/uttarakhand-festival.jpg"

# Download overview images
download_image "https://source.unsplash.com/1200x800/?uttarakhand,landscape" "images/uttarakhand-overview.jpg"
download_image "https://source.unsplash.com/1200x800/?uttarakhand,mountains" "images/uttarakhand-overview_1.jpg"

echo "Image download process complete!" 