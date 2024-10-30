import React from 'react';

function About() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9f9f9] py-10 px-4">
      <div className="max-w-2xl text-center bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Acerca Us</h1>
        <p className="text-gray-600 text-lg mb-6">
         Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit ab facilis, laborum modi totam minus expedita fuga unde at nihil maiores voluptatibus tenetur, illo adipisci quasi consectetur temporibus inventore dicta.
        </p>
        <p className="text-gray-600 text-lg mb-6">
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Distinctio odit debitis adipisci quam, voluptas, id possimus veritatis voluptatem necessitatibus dicta fuga consequatu
        </p>
        <button className="mt-4 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-md hover:opacity-90">
          Learn 
        </button>
      </div>
    </div>
  );
}

export default About;
