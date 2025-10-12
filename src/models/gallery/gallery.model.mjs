import { Schema, model } from 'mongoose';

const gallerySchema = new Schema({
   
    image: {
        type: String,
    },
   
});

export const Gallery = model('Gallery', gallerySchema);
