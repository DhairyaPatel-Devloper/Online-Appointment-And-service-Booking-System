package com.bookwithtech.model;

/**
 * POJO matching the "images" table exactly.
 */
public class Image {

    private int    imageId;
    private int    providerId;    // FK → providerdetails.providerid
    private String imageSource;   // URL or Cloudinary path

    public Image() {}

    public Image(int imageId, int providerId, String imageSource) {
        this.imageId     = imageId;
        this.providerId  = providerId;
        this.imageSource = imageSource;
    }

    // ── Getters & Setters ────────────────────────────────────────────────

    public int getImageId()                         { return imageId; }
    public void setImageId(int imageId)             { this.imageId = imageId; }

    public int getProviderId()                      { return providerId; }
    public void setProviderId(int providerId)       { this.providerId = providerId; }

    public String getImageSource()                  { return imageSource; }
    public void setImageSource(String imageSource)  { this.imageSource = imageSource; }

    @Override
    public String toString() {
        return "Image{imageId=" + imageId + ", providerId=" + providerId + "}";
    }
}
