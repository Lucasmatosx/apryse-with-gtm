//---------------------------------------------------------------------------------------
// Copyright (c) 2001-2023 by Apryse Software Inc. All Rights Reserved.
// Consult legal.txt regarding legal and license information.
//---------------------------------------------------------------------------------------

(exports => {
  // @link PDFNet: https://docs.apryse.com/api/web/Core.PDFNet.html
  // @link PDFNet.PDFDoc: https://docs.apryse.com/api/web/Core.PDFNet.PDFDoc.html
  // @link FilterReader: https://docs.apryse.com/api/web/Core.PDFNet.FilterReader.html

  exports.runWebViewerConvertTest = () => {
    const PDFNet = exports.Core.PDFNet;

    const main = async () => {
      console.log('Beginning Test');
      let ret = 0;
      const inputPath = '../TestFiles/';
      try {
        const doc = await PDFNet.PDFDoc.createFromURL(inputPath + 'tiger.pdf');
        doc.initSecurityHandler();
        doc.lock();
        console.log('PDFNet and PDF document initialized and locked');

        const XodBuffer = await doc.convertToXod();

        saveBufferAsXOD(XodBuffer, 'from_pdf.xod');

        // have example of streaming

        const XodFilter = await doc.convertToXodStream();
        const XodFilterReader = await PDFNet.FilterReader.create(XodFilter);
        const dataArray = []; // used to store all the data of the .xod file
        const chunkLength = 1024; // size of every chunk stored in
        let retrievedLength = chunkLength; // amount of data to place in dataArray at a time
        while (chunkLength === retrievedLength) {
          const bufferSubArray = await XodFilterReader.read(chunkLength);
          retrievedLength = bufferSubArray.length;
          dataArray.push(bufferSubArray);
        }
        const bufferFinal = new Uint8Array(dataArray.length * chunkLength + retrievedLength);
        for (let i = 0; i < dataArray.length; i++) {
          const offset = i * chunkLength;
          const currentArr = dataArray[i];
          bufferFinal.set(currentArr, offset);
        }
        saveBufferAsXOD(bufferFinal, 'from_pdf_streamed.xod');
        console.log('done.');
      } catch (err) {
        console.log(err.stack);
        ret = 1;
      }
      return ret;
    };
    // add your own license key as the second parameter, e.g. PDFNet.runWithCleanup(main, 'YOUR_LICENSE_KEY')
    PDFNet.runWithCleanup(main);
  };
})(window);
// eslint-disable-next-line spaced-comment
//# sourceURL=WebViewerConvertTest.js
