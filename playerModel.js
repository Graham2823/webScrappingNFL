import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
	name: {
		type: String,
	},
	position: {
		type: String,
	},
	age: { 
        type: String 
    },
	height: { 
        type: String 
    },
	weight: { 
        type: String 
    },
	exp: { 
        type: String 
    },
});

const Player = mongoose.model("Player", playerSchema)