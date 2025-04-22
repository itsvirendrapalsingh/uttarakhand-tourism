#!/bin/bash

# Function to download an image if needed
download_image() {
    local url="$1"
    local output="$2"
    local dir=$(dirname "$output")
    
    # Create directory if it doesn't exist
    mkdir -p "$dir"
    
    # Check if file exists and is greater than 5KB
    if [ ! -f "$output" ] || [ $(stat -c%s "$output") -lt 5000 ]; then
        echo "Downloading $output..."
        curl -L "$url" -o "$output"
        if [ $? -eq 0 ]; then
            echo "Successfully downloaded $output"
        else
            echo "Failed to download $output"
        fi
    else
        echo "File $output already exists and is valid"
    fi
}

# Fix small/corrupt images
# Destinations
download_image "https://source.unsplash.com/random/800x600/?kedarnath,temple" "images/destinations/kedarnath.jpg"
download_image "https://source.unsplash.com/random/800x600/?kausani,hill" "images/destinations/kausani.jpg"
download_image "https://source.unsplash.com/random/800x600/?ranikhet,hills" "images/destinations/ranikhet.jpg"
download_image "https://source.unsplash.com/random/800x600/?nainital,lake" "images/destinations/nainital-large.jpg"
download_image "https://source.unsplash.com/random/800x600/?rishikesh,river" "images/destinations/rishikesh-large.jpg"
download_image "https://source.unsplash.com/random/800x600/?uttarakhand,seasons" "images/destinations/seasons-uttarakhand.jpg"
download_image "https://source.unsplash.com/random/800x600/?uttarakhand,transport" "images/destinations/transport-uttarakhand.jpg"
download_image "https://source.unsplash.com/random/800x600/?uttarakhand,food" "images/destinations/local-food.jpg"

# Gallery
download_image "https://source.unsplash.com/random/800x600/?nanda,devi,peak" "images/gallery/nanda-devi.jpg"
download_image "https://source.unsplash.com/random/800x600/?panchachuli,peaks" "images/gallery/panchachuli.jpg"
download_image "https://source.unsplash.com/random/800x600/?rishikesh,temple" "images/gallery/rishikesh-temple.jpg"
download_image "https://source.unsplash.com/random/800x600/?trishul,peak" "images/gallery/trishul-peak.jpg"
download_image "https://source.unsplash.com/random/800x600/?bhimtal,lake" "images/gallery/bhimtal.jpg"
download_image "https://source.unsplash.com/random/800x600/?corbett,elephant" "images/gallery/elephant-corbett.jpg"
download_image "https://source.unsplash.com/random/800x600/?uttarakhand,folk,dance" "images/gallery/folk-dance.jpg"
download_image "https://source.unsplash.com/random/800x600/?ganga,aarti" "images/gallery/ganga-aarti.jpg"
download_image "https://source.unsplash.com/random/800x600/?himalayan,birds" "images/gallery/himalayan-birds.jpg"
download_image "https://source.unsplash.com/random/800x600/?khurpatal,lake" "images/gallery/khurpatal.jpg"
download_image "https://source.unsplash.com/random/800x600/?leopard,wildlife" "images/gallery/leopard.jpg"
download_image "https://source.unsplash.com/random/800x600/?uttarakhand,cuisine" "images/gallery/local-cuisine.jpg"
download_image "https://source.unsplash.com/random/800x600/?uttarakhand,festival" "images/gallery/local-festival.jpg"
download_image "https://source.unsplash.com/random/800x600/?naini,lake" "images/gallery/naini-lake.jpg"
download_image "https://source.unsplash.com/random/800x600/?sattal,lake" "images/gallery/sattal.jpg"
download_image "https://source.unsplash.com/random/800x600/?corbett,tiger" "images/gallery/tiger-corbett.jpg"
download_image "https://source.unsplash.com/random/800x600/?uttarakhand,village" "images/gallery/village-life.jpg"

echo "Image fix process complete!" 