module.exports.fileUpload = async (file, fileName) => {
    file.mv(`./public/${fileName}.jpg`, (err) => {
      if (err) {
        console.log({ error });
        throw err;
      }
    });
    return true;
  };