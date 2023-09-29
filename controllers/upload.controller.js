const UserModel = require("../models/user.model");
const fs = require("fs");
const { promisify } = require("util");
const mime = require("mime-types");

module.exports.uploadProfil = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    const fileMime = mime.lookup(req.file.originalname);

    if (!fileMime || !["image/jpeg", "image/png", "image/jpg"].includes(fileMime)) {
      return res.status(400).send("Invalid file type");
    }

    if (req.file.size > 4096000) {
      return res.status(400).send("File size exceeds the limit 4MB");
    }

    const fileName = `${req.body.name}.jpg`;
    const filePath = `./client/public/uploads/profil/${fileName}`;

    // Utilisation de fs.promises.writeFile pour enregistrer le fichier
    await fs.promises.writeFile(filePath, req.file.buffer);

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.body.userId,
      { $set: { picture: "./uploads/profil/" + fileName } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json(updatedUser);
  } catch (err) {
    return res.status(500).send(err.message);
  }
};
