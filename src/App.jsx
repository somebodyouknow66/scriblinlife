import React from "react";
import "./App.css";
import { Stage, Layer, Text, Line, Circle, Star} from "react-konva";
import {Image as KonvaImage} from "react-konva"
import Konva from "konva"
import useImage from "use-image";
import * as Tone from "tone";


const ogScriblinLifeMessages = [
  "you don't have time",
  "what are you doing here?",
  "you can't stay any longer",
  "the meaning of life is:",
  "you already know it",
  "be kind fr",
  "give all the credit to God",
  "you are nothing yet you are everything",
];


const emotionalMesaages = [
  "Wanna listen My 'Dard'",
  "Soo, nothing is to cry",
  "But, sad like i remember those days",
  "the little child (ME)",
  "if he falls down",
  "others comes to pick",
  "But, now the people wanna see That little",
  "to fall!",
  "i donno what is written in my 'fate'",
  "But, i always pray",
  "that everyone could have the Best Fate",
  "Thank You... _iammohsinn404_",
]

const messageSets = {
  "ogScriblinLifeMessages by somebodyouknow": ogScriblinLifeMessages,
  "emotionalMesaages by _iammohsinn404_": emotionalMesaages
}

const App = () => {

  const width = 640;
  const height = 160;

  const [started, setStarted] = React.useState(false);
  const [revealed, setRevealed] = React.useState(false);
  const [msgNumber, setMsgNumber] = React.useState(0);
  const [selectedMessages, setSelectedMessages] = React.useState(ogScriblinLifeMessages);
  const [selectedSetName, setSelectedSetName] = React.useState("ogScriblinLifeMessages by somebodyouknow");
  const [theme, setTheme] = React.useState("depressing");

  const isDrawing = React.useRef(false);
  const coatLayer = React.useRef(null);
  const drawTimeoutRef = React.useRef(null);
  const [lines, setLines] = React.useState([]);
 

  const noiseRef = React.useRef(null);
  const filterRef = React.useRef(null);
  const synthRef = React.useRef(null);
  const soundStarted = React.useRef(null);
  const musicRef = React.useRef(null);

  const FIREFLIES_NUM = 30;
  const fireflyRef = React.useRef(null);
  const fireflyNodes = React.useRef([]);


  const STARS_NUM = 25;
  const starsRef = React.useRef(null);
  const starsNodes = React.useRef([]);

  const [bgSize, setBgSize] = React.useState({ width: window.innerWidth, height: window.innerHeight})

  const checkShown = () => {
    const layer = coatLayer.current;
    if (!layer) return;
    const ctx = layer.getContext();
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const { data } = ctx.getImageData(0, 0, width, height);
    let transparentCount = 0;
    let totalSampled = 0;
    for (let i = 3; i < data.length; i += 4 * 20) {
      totalSampled++;
      if (data[i] == 0) transparentCount++;
    }
    const percent = transparentCount / totalSampled;
    console.log(percent);
    if (percent > 0.1) {
      setRevealed(true);
      console.log("revealed")
    }
  };

  // scribbling sound
  React.useEffect(() => {
    const noise = new Tone.Noise("white");
    const filter = new Tone.Filter(3500, "highpass");
    noise.connect(filter);
    filter.toDestination();
    noise.volume.value = -Infinity; // 0%

    const synth = new Tone.Synth().toDestination();
    noiseRef.current = noise;
    filterRef.current = filter;
    synthRef.current = synth;

    return () => {
      noise.dispose();
      filter.dispose();
      synth.dispose();
    };
  }, []);

// fireflies
React.useEffect(() => {
  const animation = new Konva.Animation((frame) => {
    fireflyNodes.current.forEach((node, i) => {
      if (!node) return;
      const t = frame.time / 2000 + i * 5;
      const x =
        bgSize.width / 2 +
        Math.sin(t * 0.3) * (bgSize.width / 2.5) +
        Math.sin(t * 1.7) * 40;
      const y =
        bgSize.height / 2 +
        Math.cos(t * 0.4) * (bgSize.height / 2.5) +
        Math.cos(t * 2.1) * 30;
      node.x(x);
      node.y(y);
      node.opacity(0.4 + Math.abs(Math.sin(t * 2)) * 0.6);
    });
  }, fireflyRef.current);
  animation.start();
  return () => animation.stop();
}, [bgSize, theme]);


// starts animation

React.useEffect(() => {
  starsNodes.current.forEach((node, i) => {
    if (!node) return;
    node.y(bgSize.height + (i * 40) % bgSize.height);
    node.x(Math.random() * bgSize.width);
  });
  const animation = new Konva.Animation((frame) => {
    starsNodes.current.forEach((node) => {
      if (!node) return;
      let y = node.y() - 0.5;
      if (y < -10) y = bgSize.height + 10;
      node.y(y);
    });
  }, starsRef.current);
  animation.start();
  return () => animation.stop();
}, [bgSize, theme]);


// theme 

React.useEffect(() => {
  document.body.dataset.theme = theme;
}, [theme]);

  const handleMouseDown = async (e) => {
     const pos = e.target.getStage().getPointerPosition();
    if (!soundStarted.current) {
      await Tone.start();
      await Tone.loaded();
      noiseRef.current.start();
      musicRef.current.play();
      musicRef.current.volume = 0.5;
      soundStarted.current = true;

    }

    isDrawing.current = true;
    setLines((prev) => [...prev, [pos.x, pos.y]]);
   
  
    if (!pos) return;

    clearTimeout(drawTimeoutRef.current);
    drawTimeoutRef.current = setTimeout(() => {
      isDrawing.current = false;
      noiseRef.current.volume.rampTo(-Infinity, 0.5);
      checkShown();
    }, 3000)
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    const pos = e.target.getStage().getPointerPosition();
    if (!pos) return;

      setLines((prev) => {
      const newLines = [...prev];
      newLines[newLines.length - 1] = newLines[newLines.length - 1].concat([
        pos.x,
        pos.y,
      ]);
      return newLines;
    });

    const freq = 300 + Math.random() * 800;
    filterRef.current.frequency.rampTo(freq, 0.03);
    noiseRef.current.volume.rampTo(-30, 0.3);

    
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    clearTimeout(drawTimeoutRef.current);
    noiseRef.current.volume.rampTo(-Infinity, 0.1);
    checkShown();
  };

  const nextMessage = () => {
    setRevealed(false);
    setLines([]);
    setMsgNumber((i) => (i + 1) % selectedMessages.length);
  
  };


  const [foilImg] = useImage("/foil.jpg");

  const photoCrop = (imgW, imgH, boxW, boxH) => {
    const scale = Math.max(boxW / imgW, boxH / imgH);

    return {
      width: imgW * scale,
      height: imgH * scale,
      x: (boxW - imgW * scale) / 2,
      y: (boxH - imgH * scale) / 2,
    };
  };

  return (
    <>


       
{!started ? (
      <div className="splash-screen" >
        <h1>scriblinlife</h1>
        <p className="subtitle">scribble, keep scribblin.</p>
        <button className="start" onClick={() => setStarted(true)}>start game</button>
        <div className="instructions"></div>
        <p className="extraMessage">if you want to add your own messages, check out the <a href="https://github.com/somebodyouknow66/scriblinlife">repo and readme</a>, it's actually simple</p>
      </div>
    ) : (
 
      <>
      <audio ref={musicRef} src="/Relent.mp3" loop />

      <select 
        value={selectedSetName} 
        onChange = {(e) => {
          setSelectedSetName(e.target.value);
          setSelectedMessages(messageSets[e.target.value]);
          setMsgNumber(0);
          setRevealed(false);
          setLines([])
        }}
        >
          {Object.keys(messageSets).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        
        </select>

        <div className="stage-container">
      <Stage
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}

      >
        <Layer>
          <Text
            text={selectedMessages[msgNumber]}
            x={0}
            y={0}
            width={width}
            height={height}
            align="center"
            verticalAlign="middle"
            fontSize={30}
            fontFamily="Mansalva"
            fill="white"
          />
        </Layer>

        

        <Layer ref={coatLayer}>
          {foilImg && (() => {
            const fit = photoCrop(foilImg.width, foilImg.height, width, height);
            return <KonvaImage image={foilImg} x={fit.x} y={fit.y} width={fit.width} height={fit.height} />
          })()}
          {lines.map((points, i) => (
          <Line
            key={i}
            points={points}
            stroke="white"
            strokeWidth={15}
            lineCap="round"
            lineJoin="round"
            globalCompositeOperation="destination-out"
            />
          ))}
        </Layer>

     

   </Stage>

      {revealed && <button className="next" onClick={nextMessage}>→</button>}
    <button onClick={() => setTheme(theme === "depressing" ? "chill" : "depressing")} className="mode">
          switch to  mode
        </button>
          
          <div className={`wave-wipe ${theme}`} key={theme}></div>

  { theme === "depressing" && (
    <Stage width={bgSize.width} height={bgSize.height} style={{ position: "fixed", top: 0, left: 0, zIndex: -1 }}>
      <Layer ref={fireflyRef}>
        {Array.from({ length: FIREFLIES_NUM }).map((_, i) => (
          <Circle 
            key={i}
            ref={(node) => (fireflyNodes.current[i] = node)}
            radius={2.5}
            fill="#FDB813"
            shadowColor="#ffed7b"
            shadowBlur={4}
            shadowOpacity={2}
            />

        ))}
      </Layer>
    </Stage>
  )}
  {theme === "chill" && (
    <Stage width={bgSize.width} height={bgSize.height} style={{ position: "fixed", top: 0, left: 0, zIndex: -1 }}>
      <Layer ref={starsRef}>
        {Array.from({ length: STARS_NUM }).map((_, i) => (
          <Star
            key={i}
            ref={(node) => (starsNodes.current[i] = node)}
            numPoints={5}
            innerRadius={7}
            outerRadius={12}
            fill="#FDB813"
            shadowColor="#ffed7b"
            shadowBlur={4}
            shadowOpacity={0.8}
            />

        ))}
      </Layer>
    </Stage>

  )}
        </div>
    </>
    )}
    </>
  );
};

export default App;
