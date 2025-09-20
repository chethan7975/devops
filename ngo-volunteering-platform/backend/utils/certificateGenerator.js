const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const generateCertificate = async (certificateData) => {
  const {
    volunteerId,
    volunteerName,
    ngoName,
    serviceDays,
    startDate,
    endDate,
    certificateId,
    verificationCode,
    ngoLogo
  } = certificateData;

  return new Promise(async (resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      // Create certificates directory if it doesn't exist
      const certificatesDir = path.join(__dirname, '..', 'certificates');
      if (!fs.existsSync(certificatesDir)) {
        fs.mkdirSync(certificatesDir, { recursive: true });
      }

      const fileName = `certificate_${certificateId}.pdf`;
      const filePath = path.join(certificatesDir, fileName);
      
      // Pipe the PDF to a file
      doc.pipe(fs.createWriteStream(filePath));

      // Generate QR code for verification
      const verificationUrl = `${process.env.CLIENT_URL}/verify/${verificationCode}`;
      const qrCodeBuffer = await QRCode.toBuffer(verificationUrl, {
        width: 150,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Certificate design
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const centerX = pageWidth / 2;

      // Border
      doc.rect(30, 30, pageWidth - 60, pageHeight - 60)
         .stroke('#2563eb');

      doc.rect(40, 40, pageWidth - 80, pageHeight - 80)
         .stroke('#2563eb');

      // Header
      doc.fontSize(32)
         .fillColor('#2563eb')
         .text('CERTIFICATE OF APPRECIATION', centerX - 200, 80, {
           width: 400,
           align: 'center'
         });

      // Decorative line
      doc.moveTo(centerX - 150, 130)
         .lineTo(centerX + 150, 130)
         .stroke('#2563eb');

      // Main content
      doc.fontSize(16)
         .fillColor('#374151')
         .text('This is to certify that', centerX - 100, 170, {
           width: 200,
           align: 'center'
         });

      // Volunteer name
      doc.fontSize(28)
         .fillColor('#1f2937')
         .font('Helvetica-Bold')
         .text(volunteerName, centerX - 200, 210, {
           width: 400,
           align: 'center'
         });

      // Service details
      doc.fontSize(16)
         .fillColor('#374151')
         .font('Helvetica')
         .text('has successfully completed', centerX - 120, 260, {
           width: 240,
           align: 'center'
         });

      doc.fontSize(24)
         .fillColor('#2563eb')
         .font('Helvetica-Bold')
         .text(`${serviceDays} days of volunteer service`, centerX - 200, 290, {
           width: 400,
           align: 'center'
         });

      doc.fontSize(16)
         .fillColor('#374151')
         .font('Helvetica')
         .text(`with ${ngoName}`, centerX - 150, 330, {
           width: 300,
           align: 'center'
         });

      // Service period
      const startDateStr = new Date(startDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const endDateStr = new Date(endDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      doc.fontSize(14)
         .text(`Service Period: ${startDateStr} to ${endDateStr}`, centerX - 150, 370, {
           width: 300,
           align: 'center'
         });

      // Certificate ID
      doc.fontSize(12)
         .fillColor('#6b7280')
         .text(`Certificate ID: ${certificateId}`, centerX - 100, 410, {
           width: 200,
           align: 'center'
         });

      // Issue date
      const issueDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      doc.fontSize(12)
         .text(`Issued on: ${issueDate}`, centerX - 100, 430, {
           width: 200,
           align: 'center'
         });

      // NGO signature area
      doc.fontSize(14)
         .fillColor('#1f2937')
         .text('Authorized by:', 100, 480);

      doc.fontSize(16)
         .font('Helvetica-Bold')
         .text(ngoName, 100, 500);

      // Add QR code for verification
      doc.image(qrCodeBuffer, pageWidth - 200, 450, {
        width: 100,
        height: 100
      });

      doc.fontSize(10)
         .fillColor('#6b7280')
         .text('Scan to verify', pageWidth - 180, 560, {
           width: 60,
           align: 'center'
         });

      // Footer
      doc.fontSize(10)
         .fillColor('#9ca3af')
         .text('This certificate is digitally generated and verified.', 50, pageHeight - 80, {
           width: pageWidth - 100,
           align: 'center'
         });

      // Finalize the PDF
      doc.end();

      // Wait for the PDF to be written
      doc.on('end', () => {
        resolve({
          fileName,
          filePath,
          relativePath: `certificates/${fileName}`
        });
      });

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateCertificate };