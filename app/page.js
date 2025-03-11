'use client';
import React, { useState, useEffect, useRef } from "react";
import { 
  FaEdit, 
  FaTrashAlt, 
  FaHeart, 
  FaRegHeart, 
  FaArrowUp, 
  FaChevronLeft, 
  FaChevronRight 
} from "react-icons/fa";

export default function Home() {
  const [names, setNames] = useState([]);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [highlightedId, setHighlightedId] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const apiUrl = "http://localhost:5000/names";
  const letterRefs = useRef({});
  const alphabetContainerRef = useRef(null);
  const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // Fetch names from API
  const fetchNames = async () => {
    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      data.sort((a, b) => a.firstName.localeCompare(b.firstName));
      setNames(data);
    } catch (err) {
      console.error("Error fetching names:", err);
    }
  };

  useEffect(() => {
    fetchNames();
  }, []);

  // Monitor scroll to toggle scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAddName = async () => {
    if (!newName.trim()) return;
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: newName, liked: false }),
      });
      if (res.ok) {
        setNewName("");
        fetchNames();
      }
    } catch (err) {
      console.error("Error adding name:", err);
    }
  };

  const handleDeleteName = async (id) => {
    try {
      const res = await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
      if (res.ok) fetchNames();
    } catch (err) {
      console.error("Error deleting name:", err);
    }
  };

  const handleEditName = (id) => {
    const nameToEdit = names.find((name) => name._id === id);
    if (nameToEdit) {
      setEditId(id);
      setEditName(nameToEdit.firstName);
    }
  };

  const handleUpdateName = async () => {
    try {
      const res = await fetch(`${apiUrl}/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: editName }),
      });
      if (res.ok) {
        setEditId(null);
        setEditName("");
        fetchNames();
      }
    } catch (err) {
      console.error("Error updating name:", err);
    }
  };

  const handleToggleLike = async (id, currentLiked) => {
    try {
      await fetch(`${apiUrl}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liked: !currentLiked }),
      });
      fetchNames();
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  // Group names by first letter
  const groupedNames = names.reduce((groups, name) => {
    const letter = name.firstName[0].toUpperCase();
    if (!groups[letter]) {
      groups[letter] = [];
    }
    groups[letter].push(name);
    return groups;
  }, {});

  const sortedLetters = Object.keys(groupedNames).sort();

  const handleAlphabetClick = (letter) => {
    if (letterRefs.current[letter]) {
      letterRefs.current[letter].scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      alert(`There are no names with the letter ${letter}`);
    }
  };

  const handleRandomClick = () => {
    if (!names.length) {
      alert("There are no names available.");
      return;
    }
    const randomIndex = Math.floor(Math.random() * names.length);
    const randomName = names[randomIndex];
    setHighlightedId(randomName._id);
    document.getElementById(randomName._id)?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      setHighlightedId(null);
    }, 3000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Alphabet container horizontal scroll functions
  const scrollAlphabetLeft = () => {
    if (alphabetContainerRef.current) {
      alphabetContainerRef.current.scrollBy({ left: -100, behavior: "smooth" });
    }
  };

  const scrollAlphabetRight = () => {
    if (alphabetContainerRef.current) {
      alphabetContainerRef.current.scrollBy({ left: 100, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">


      <h1 className="justify-center text-center text-3xl font-mono py-8">
        Crazy in-game Names
      </h1>

      {/* Header: Input and Alphabet Bar */}
      <div className="max-w-5xl mx-auto px-4 py-4">


       
        {/* Add Name Section */}
        <div className="p-4 rounded-lg shadow mb-4">
          
          <div className="flex items-center justify-center">
         
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddName()}
              placeholder="Enter crazy name"
              className="w-full max-w-md bg-gray-700 border-2 border-gray-500 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 mr-4"
            />
            <button
              onClick={handleAddName}
              className="bg-green-500 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
            >
              Add
            </button>
          </div>
        </div>
        {/* Alphabet Bar with Left/Right Arrows and Random Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
          <div className="w-full max-w-md flex items-center">
            <FaChevronLeft 
              onClick={scrollAlphabetLeft} 
              className="cursor-pointer text-gray-300 hover:text-white" 
            />
            <div 
              ref={alphabetContainerRef} 
              className="overflow-x-auto flex-grow mx-2"
              style={{ scrollbarWidth: "none" }} // For Firefox; can add custom CSS for hiding scrollbar if desired
            >
              <div className="flex whitespace-nowrap">
                {alphabets.map((letter, index) => (
                  <React.Fragment key={letter}>
                    <span
                      onClick={() => handleAlphabetClick(letter)}
                      className="cursor-pointer px-3 py-2 hover:bg-blue-500 hover:text-white select-none text-center"
                    >
                      {letter}
                    </span>
                    {index !== alphabets.length - 1 && (
                      <span className="border-l border-gray-600"></span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <FaChevronRight 
              onClick={scrollAlphabetRight} 
              className="cursor-pointer text-gray-300 hover:text-white" 
            />
          </div>
          <button
            onClick={handleRandomClick}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-1 px-3 rounded cursor-pointer"
          >
            Random
          </button>
        </div>
      </div>
      {/* Main Content: Grouped Names */}
      <div className="max-w-5xl mx-auto px-4 pb-8">
        {sortedLetters.map((letter) => (
          <div
            key={letter}
            ref={(el) => (letterRefs.current[letter] = el)}
            className="mb-8 w-full"
          >
            <h2 className="text-2xl font-bold mb-4">{letter}</h2>
            <div className="flex flex-wrap gap-4">
              {groupedNames[letter].map((name) => (
                <div
                  key={name._id}
                  id={name._id}
                  className={`group bg-gray-800 rounded shadow p-4 relative flex items-center justify-center ${
                    highlightedId === name._id ? "ring-4 ring-fuchsia-800" : ""
                  }`}
                  style={{
                    width: `${Math.max(120, name.firstName.length * 12)}px`,
                  }}
                >
                  {editId === name._id ? (
                    <div className="flex flex-col items-center w-full">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-gray-700 border-2 border-gray-500 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 mb-2"
                      />
                      <div className="flex justify-between gap-2">
                        <button
                          onClick={handleUpdateName}
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-2 rounded-lg"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-1 px-2 rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-lg whitespace-nowrap text-center">
                        {name.firstName}
                      </p>
                      <div
                        className="absolute flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          bottom: "calc(100% + 5px)",
                          left: "50%",
                          transform: "translateX(-50%)",
                        }}
                      >
                        <button
                          onClick={() => handleToggleLike(name._id, name.liked)}
                          className="p-2 rounded cursor-pointer"
                        >
                          {name.liked ? (
                            <FaHeart size={18} className="text-red-500" />
                          ) : (
                            <FaRegHeart size={18} className="text-white" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEditName(name._id)}
                          className="bg-yellow-600 hover:bg-yellow-700 p-2 rounded cursor-pointer"
                        >
                          <FaEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteName(name._id)}
                          className="bg-red-600 hover:bg-red-700 p-2 rounded cursor-pointer"
                        >
                          <FaTrashAlt size={18} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Scroll-to-Top Arrow (only visible when scrolled down) */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full z-50"
        >
          <FaArrowUp size={24} />
        </button>
      )}
    </div>
  );
}
