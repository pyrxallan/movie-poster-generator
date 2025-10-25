import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload } from 'lucide-react';

export default function MoviePosterGenerator() {
  const [image, setImage] = useState(null);
  const [movieData, setMovieData] = useState({
    title: 'CATCH ME IF YOU CAN',
    year: '2002',
    tagline: '',
    directors: 'STEVEN SPIELBERG',
    writers: 'JEFF NATHANSON, STAN REDDING, FRANK ABAGNALE',
    cast: 'LEONARDO DICAPRIO TOM HANKS CHRISTOPHER WALKEN'
  });
  const [posterGenerated, setPosterGenerated] = useState(false);
  
  const canvasRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        setPosterGenerated(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    setMovieData({
      ...movieData,
      [e.target.name]: e.target.value
    });
    setPosterGenerated(false);
  };

  const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, x, currentY);
        line = words[i] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  };

  const generatePoster = () => {
    if (!image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Set canvas size to match common poster dimensions
      const posterWidth = 800;
      const posterHeight = 1200;
      canvas.width = posterWidth;
      canvas.height = posterHeight;

      // Draw the uploaded image
      ctx.drawImage(img, 0, 0, posterWidth, posterHeight);

      // Add dark overlay at bottom for text
      const gradientHeight = 350;
      const gradient = ctx.createLinearGradient(0, posterHeight - gradientHeight, 0, posterHeight);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.7)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, posterHeight - gradientHeight, posterWidth, gradientHeight);

      // Set text properties
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';

      // Draw title
      ctx.font = 'bold 56px Arial, sans-serif';
      const titleY = posterHeight - 180;
      ctx.fillText(movieData.title.toUpperCase(), posterWidth / 2, titleY);

      // Draw tagline if exists
      if (movieData.tagline) {
        ctx.font = 'italic 20px Georgia, serif';
        ctx.fillText(movieData.tagline, posterWidth / 2, titleY - 40);
      }

      // Draw year
      ctx.font = '28px Arial, sans-serif';
      ctx.fillText(movieData.year, posterWidth / 2, titleY + 40);

      // Draw credits
      ctx.font = '14px Arial, sans-serif';
      ctx.fillStyle = '#cccccc';
      let creditsY = titleY + 80;

      if (movieData.directors) {
        ctx.fillText(`directed by ${movieData.directors.toUpperCase()}`, posterWidth / 2, creditsY);
        creditsY += 25;
      }

      if (movieData.writers) {
        const writerText = `written by ${movieData.writers.toUpperCase()}`;
        const maxWidth = posterWidth - 100;
        wrapText(ctx, writerText, posterWidth / 2, creditsY, maxWidth, 22);
        creditsY += 25;
      }

      if (movieData.cast) {
        creditsY += 15;
        ctx.font = '16px Arial, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('starring', posterWidth / 2, creditsY);
        creditsY += 25;
        ctx.font = '14px Arial, sans-serif';
        ctx.fillStyle = '#cccccc';
        const maxWidth = posterWidth - 100;
        wrapText(ctx, movieData.cast.toUpperCase(), posterWidth / 2, creditsY, maxWidth, 22);
      }

      setPosterGenerated(true);
    };

    img.src = image;
  };

  const downloadPoster = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `${movieData.title.toLowerCase().replace(/\s+/g, '-')}-poster.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  useEffect(() => {
    if (image) {
      generatePoster();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Movie Poster Generator
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Upload & Details</h2>
            
            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image
              </label>
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {image ? (
                    <img src={image} alt="Preview" className="max-h-40 object-contain" />
                  ) : (
                    <>
                      <Upload className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="text-sm text-gray-500">Click to upload image</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Movie Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={movieData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter movie title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <input
                  type="text"
                  name="year"
                  value={movieData.year}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tagline (Optional)
                </label>
                <input
                  type="text"
                  name="tagline"
                  value={movieData.tagline}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter tagline"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Director(s)
                </label>
                <input
                  type="text"
                  name="directors"
                  value={movieData.directors}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Director names"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Writer(s)
                </label>
                <input
                  type="text"
                  name="writers"
                  value={movieData.writers}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Writer names separated by commas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cast
                </label>
                <textarea
                  name="cast"
                  value={movieData.cast}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Actor names separated by spaces"
                />
              </div>

              <button
                onClick={generatePoster}
                disabled={!image}
                className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
              >
                Generate Poster
              </button>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Preview</h2>
            
            <div className="flex flex-col items-center">
              {image ? (
                <>
                  <canvas
                    ref={canvasRef}
                    className="max-w-full h-auto shadow-2xl rounded-lg"
                  />
                  {posterGenerated && (
                    <button
                      onClick={downloadPoster}
                      className="mt-4 flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition font-semibold"
                    >
                      <Download className="w-5 h-5" />
                      Download Poster
                    </button>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                  <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg">Upload an image to generate poster</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}