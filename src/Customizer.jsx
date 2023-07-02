import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSnapshot } from 'valtio';

import config from './config/config';
import state from './store';
import { download } from './assets';
import { reader, downloadCanvasToImage } from './config/helpers';
import { EditorTabs, FilterTabs, DecalTypes } from './config/constants';
import { fadeAnimation, slideAnimation } from './config/motion';

import { AIpicker, Colorpicker, CustomButton, Filepicker, Tab } from './components';

const Customizer = () => {
  const snap = useSnapshot(state);

  const [file, setFile] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generatingImg, setGeneratingImg] = useState(false);
  const [activeEditorTab, setActiveEditorTab] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState({
    logoShirt: true,
    stylishShirt: false,
  });

  const generateTabContent = () => {
    switch (activeEditorTab) {
      case 'colorpicker':
        return (
          <>
            <Colorpicker />
            <CustomButton
              type="outline"
              title="Close"
              handleClick={() => setActiveEditorTab('')}
              customStyles="mt-3"
            />
          </>
        );
      case 'filepicker':
        return (
          <>
            <Filepicker file={file} setFile={setFile} readFile={readFile} />
            <CustomButton
              type="outline"
              title="Close"
              handleClick={() => setActiveEditorTab('')}
              customStyles="mt-3"
            />
          </>
        );
      case 'aipicker':
        return (
          <>
            <AIpicker
              prompt={prompt}
              setPrompt={setPrompt}
              generatingImg={generatingImg}
              handleSubmit={handleSubmit}
            />
            <CustomButton
              type="outline"
              title="Close"
              handleClick={() => setActiveEditorTab('')}
              customStyles="mt-3"
            />
          </>
        );
      default:
        return null;
    }
  };

  const handleSubmit = async (type) => {
    if (!prompt) return alert('Please enter a prompt');

    try {
      setGeneratingImg(true);
      const response = await fetch('https://open-ai21.p.rapidapi.com/texttoimage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-RapidAPI-Key': 'be443b36e0msh152dfdc57384160p101b93jsn7a4148386c5f',
          'X-RapidAPI-Host': 'open-ai21.p.rapidapi.com',
        },
        body: new URLSearchParams({
          text: prompt,
        }),
      });

      const data = await response.json();
      const imageUrl = data.url;
      handleDecals(type, imageUrl);
    } catch (error) {
      alert(error);
    } finally {
      setGeneratingImg(false);
      setActiveEditorTab('');
    }
  };

  const handleDecals = (type, result) => {
    const decalType = DecalTypes[type];

    state[decalType.stateProperty] = result;

    if (!activeFilterTab[decalType.filterTab]) {
      handleActiveFilterTab(decalType.filterTab);
    }
  };

  const handleActiveFilterTab = (tabName) => {
    switch (tabName) {
      case 'logoShirt':
        state.isLogoTexture = !activeFilterTab[tabName];
        break;
      case 'stylishShirt':
        state.isFullTexture = !activeFilterTab[tabName];
        break;
      default:
        state.isLogoTexture = true;
        state.isFullTexture = false;
        break;
    }

    // after setting the state, activeFilterTab is updated

    setActiveFilterTab((prevState) => {
      return {
        ...prevState,
        [tabName]: !prevState[tabName],
      };
    });
  };
  
  const readFile = (type) => {
    reader(file)
      .then((result) => {
        handleDecals(type, result);
        setActiveEditorTab('');
      });
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.ctrlKey && event.key === 'Control') {
        downloadCanvasToImage();
      }
    };

    const handleDoubleClick = () => {
      downloadCanvasToImage();
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('dblclick', handleDoubleClick);


    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('dblclick', handleDoubleClick);
  
    };
  }, []);

  return (
    <AnimatePresence>
      {!snap.intro && (
        <>
          <motion.div
            key="custom"
            className="absolute top-0 left-0 z-10"
            {...slideAnimation('left')}
          >
            <div className="flex items-center min-h-screen">
              <div className="editortabs-container tabs">
                {EditorTabs.map((tab) => (
                  <Tab
                    key={tab.name}
                    tab={tab}
                    handleClick={() => setActiveEditorTab(tab.name)}
                  />
                ))}

                {generateTabContent()}
              </div>
            </div>
          </motion.div>

          <motion.div className="absolute z-10 top-5 right-5" {...fadeAnimation}>
            <CustomButton
              type="filled"
              title="Go Back"
              handleClick={() => (state.intro = true)}
              customStyles="w-fit px-4 py-2.5 font-bold text-sm"
            />
          </motion.div>

          <motion.div className="filtertabs-container" {...slideAnimation("up")}>
            {FilterTabs.map((tab) => (
              <Tab
                key={tab.name}
                tab={tab}
                isFilterTab
                isActiveTab={activeFilterTab[tab.name]}
                handleClick={() => handleActiveFilterTab(tab.name)}
              />
            ))}
          </motion.div>

          <motion.div className="absolute top-2 left-2 text-black text-sm  font-bold z-10" {...fadeAnimation}>
            *press CTRL/Double click to download
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Customizer;