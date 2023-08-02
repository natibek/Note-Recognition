/*
Nathnael Bekele

January 5, 2021

IA sourcecode for Note Identification

*/


//these are global variables that are continuously called and used in the source code.

//functional programming
var time, start, end, bpm, know, bpmSlider, chosen, bpmYes, bpmNo, finalize, audio, audioName, uploaded, userInput, playButton, stopButton, pauseButton, restart, page,maxAmp, indexMax, backButton, notes, times, lengths;
var count = 1;
var counter = 0;

var noteArray = ["E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3", "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4", "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5"];


var noteFreq = [164.81, 174.61, 185.00, 196.00, 207.65, 220.00, 233.08, 246.94, 261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392.00, 415.30, 440.00, 466.16, 493.88, 523.25, 554.36, 587.32, 622.26, 659.26, 698.46, 739.99, 783.99, 830.61];

//oop
var fft, spectrum, amp, currNode, frequency, noteList;
var currTime = 0;


class Note {//note class for the instantiation of note objects with the type of note and length in seconds as attributes
  
  constructor(type, length) {//the constructor demands the type and length upon instantiation
    this.type = type;
    this.length = length;

  }
}

class LinkedList {//LinkedList class
  constructor(head) {//the LinkedList requires a head for instantiation
    this.head = head;
  }

  getLast() {//method returns the lastNOde in the list
    let lastNode = this.head;
    if (lastNode) {
      while (lastNode.next) {//checks if the node points to another node
        lastNode = lastNode.next;//go to the next node
      }
    }
    return lastNode;
  }
  
  addNode(node) {//to add a node, this method calls the getLast() method and adds a node that is pointed to by the last node
    this.getLast().next = node;
  }

  size() {//this method calculates and returns the size of the LinkedList
    let count = 0;//this counter is incremented until the last node is reached starting off from the head of the LinkedList.
    let node = this.head;
    while (node) {
      count++;
      node = node.next
    }
    return count;
  }
}

class Node {//node class for the nodes in the LinkedList.
  constructor(data) {//constructor requires the input of the data (notes)
    this.data = data;
    this.next = null;//the next node is null by default
  }
}

function draw() {//the draw method continuously iterates through the scope

  if (chosen == 3) {//once chosen is set to 3 in the loadNote() method, the draw method is able to enter the scope of this conditional

    spectrum = fft.analyze();//fft.analyze() is a p5.sound method which creates an array of amplitudes (volumes) at different frequencies
    end = millis();//the current final time is stored into end
    currTime = (end - start) / 1000;//the seconds that have passed are stored in currTime to keep track of how long into the audio the analysis has went

    getLoudestFrequency(spectrum);//getLoudestFrequency is called with the current spectrum passed as it's parameter

    var note = new Note(loudestFreq, currTime);//a new note object with the loudestFreq as its type and currTime as time is instantiated
    
    var node = new Node(note);//a new node with the note as its data is instantiated

    if (counter == 0) {//if this is the first iteration
      noteList = new LinkedList(node);//a LinkedList called noteList is instantiated with the node as its head
      counter++;//the counter is incremented to indicate that the LinkedList has been created
    } else if (currTime >= audio.duration()) {//if the time passed is greater than the duration of the audio 
      audio.stop();//the audio is stopped as the analysis is now complete
      chosen = 0;//chosen is set to zero so that the draw method doesn't enter the scope of the conditional
      convert();//the convert method is called
      noLoop();//this prevents the draw method from iterating anymore
    } else {
      noteList.addNode(node);//adds the node to the noteList
    }
  }

  if (chosen == 1) {//if chosen is set to one in the knownBpm() method, the draw method enters the scope of this conditional 
    background(130, 163, 154);
    textSize(30);

    text("Use the slider to choose your BPM.", 180, 200);
    text("The BPM is " + bpmSlider.value() + ".", 300, 300);//the current slider value is displayed to the user until the finalize button is pressed
  }
}


function getLoudestFrequency(spectrum) {//this method is from stackoverflow.com as a response to a question on how to find the frequency of audio 

  var nyquist = sampleRate() / 2; // 22050
  var numberOfBins = spectrum.length;//this is the length of the array that stores the amplitudes of the analyzed audio
  
  maxAmp = 0;//this is used to store the maximum amplitude
  var largestBin = 0;//this is used to store the index of where the amplitude is largest

  for (var i = 0; i < numberOfBins; i++) {//iterates over the spectrum array
    var thisAmp = spectrum[i]; // amplitude of current bin
    
    if (thisAmp > maxAmp) {//if the current amplitude is larger than the stored amplitude
      maxAmp = thisAmp;//set the maximum amplitude to the current amplitude
      largestBin = i;//the index is updated
    }
  }

  loudestFreq = largestBin * (nyquist / numberOfBins);//calculates the frequency
}

function setup() {//the setup method is called at the beginning of the code
  
  createCanvas(790, 600);
  background(130, 163, 154);
  fft = new p5.FFT(0.7, 8192);//the p5.sound library has a FFT class which helps identify frequency and amplitudes of audio inputs.
  //this is an fft object with 0.7 smoothing and 8192 indexes for storing amplidues at different variables
  instruction();
}

function back() {//the back() method is used to navigate through the interface
  
  switch (page) {//a switch case is used with the page as a parameter 
      
    case 1://if on page one (the upload page)
      userInput.remove();
      backButton.remove();//remove upload GUI
      instruction();//go to the instruction page
      break;

    case 2://if on the BPM selection page
      bpmYes.remove();
      bpmNo.remove();//remove BPM selection GUI
      upload();//go to the upload page
      break;

    case 3://if on the BPM identification page
      bpmSlider.remove();
      finalize.remove();//remove BPM selection GUI
      know = null;
      chosen = 0;//the know and chosen variable is re-set to null
      findBpm();//go back to BPM selection page

      break;

    case 4://if on the BPM calculation page
      know = null;//reset
      audio.stop();//stop the audio
      count = 0;//reset
      playButton.remove();
      pauseButton.remove();
      stopButton.remove();//remove BPM selection GUI
      findBpm();//go back to the BPM selection page
      break;
  }

}

function instruction() {
  clear();//clear the previous page
  background(130, 163, 154);
  textSize(20);
  text("This software allows you to calculate the BPM and the notes played in ", 100, 200);
  text("time of your chosen mp3 audio file.", 280, 240);
  text("Note: This software is aimed in helping beginner musicians learn songs  ", 100, 360);
  text("by giving them a starting ground to finding the notes closest to the audio ", 100, 400)
  text("and not create music transcripts (which can be found online)", 160, 440);
//provides information on the software
  
  ready = createButton("Ready");//create a ready button to continue to the next page which is upload when pressed
  ready.position(360, 500);
  ready.size(100, 50);
  ready.mousePressed(upload);
}

function upload() {
  clear();
  page = 1;//sets page to one for the back button to navigate
  backButton = createButton("Back");//creates the back button
  backButton.position(70, 50);
  backButton.size(100, 30);
  backButton.mousePressed(back);
  background(130, 163, 154);
  ready.remove();//removes the ready button that the user pressed
  textSize(30);
  text("Upload an mp3 file to analyze.", 230, 200);
  userInput = createFileInput(fileSelected);//creates an upload function which is page of the p5.dom library
  userInput.position(380, 360);

}

function fileSelected(file) {

  clear();
  background(130, 163, 154);
  page = 2;////sets page to one for the back button to navigate
  if (file.type != "audio" || file.subtype != "mpeg") {//if the uploaded data is not audio or mpeg, the user is prompted to reupload a valid audio file
    textSize(30);
    text("!Upload an mp3 audio file please!", 200, 300);
  } else {
    audioName = file.name;
    userInput.remove();
    audio = createAudio(file.data, findBpm);//if the uploaded file is validated created, the sound (data) is saved in the audio variable. Once complete, the findBpm method is called. createAudio() is an p5.sound library method 
  }
}

function findBpm() {
  
  clear();
  background(130, 163, 154);
  textSize(30);
  text("Do you know the BPM of ", 270, 200);//provides the user with the option to calculate the BPM or set the BPM that they already know
  text(audioName + " ?", 300, 270);
  bpmYes = createButton("Yes");
  bpmNo = createButton("No");//these yes and no buttons are used to navigate to the users choice
  bpmYes.position(100, 360);
  bpmYes.size(100, 50);
  bpmNo.position(620, 360);
  bpmNo.size(100, 50);
  bpmYes.mousePressed(knownBpm);//if yes, call the knownBpm() method
  bpmNo.mousePressed(unknownBpm);//if no, call the unknownBpm() method
}

function knownBpm() {
  clear();
  page = 3;//this is the third page from which the user can go back and change their mind on how the BPM is calculated
  bpmNo.remove();
  bpmYes.remove();//removes the yes and no buttons
  know = "Yes";
  background(130, 163, 154);
  bpmSlider = createSlider(30, 180, 120, 1);//a slider is used to input the known BPM
  bpmSlider.position(280, 320);
  bpmSlider.size(250);

  finalize = createButton("Finalize");//this finalize button is used to finalize the users input
  finalize.position(360, 350);
  finalize.size(100, 50);
  finalize.mousePressed(choose);

  chosen = 1;//chosen is set to one so that the draw method continuously displays the slider values
  
}

function choose() {//once the user finalizes their choice
  clear();
  chosen = 0;
  bpmSlider.remove();
  finalize.remove();//the button and slider are removed
  bpm = bpmSlider.value();//the final slider value is set to the bpm variable
  background(130, 163, 154);
  fft.setInput(audio);//the fft object
  loadNote();//calls the loadNote() method
}

function unknownBpm() {//if the suer presses the No button in the BPM selection method 
  clear();
  page = 4;//the page is set to four, hence the user can go back using the back method.
  bpmNo.remove();
  bpmYes.remove();//the yes and no buttons are removed
  know = "No";//know is set to no to activate the keyPressed method
  background(130, 163, 154);
  textSize(30);
  text("Tap on the space bar 10 times along the beat of  ", 100, 200);
  //prompts the user to tap on the space bar 10 times along to the beat of the audio
  text(audioName, 300, 240);
  playSong();//the playSong method creates a play, pause, and stop button to aid the user tap along to the beat of the song
}

function keyPressed() {//the keyPressed method is a p5 method that checks is any key on the keyboard is pressed
  if (know == "No") {//only if the user doesn't know the BPM is the following scope executed
    if (keyCode == 32) {//the keyCode 32 refers to the spacebar
      if (count == 3) {//the BPM calculation only uses the middle 5 presses as they are the most consistent
        start = millis();//the millis() returns the amount of time in milliseconds since the setup method had started
      } else if (count == 8) {//when the space bar is pressed for the 8th time
        end = millis();//the current time is stored
        time = end - start;//the duration time is the difference of the end and start time
        bpm = int(5 / (time / 60000));//the integer value of the BPM calculated by the number of presses divided by the amount of minute that has passed
      }
      textSize(30);
      background(130, 163, 154);
      text(count, 300, 380);//the number of times the space bar has been pressed is displayed continuously
      text("Tap on the space bar 10 times along the beat of  ", 100, 200);
      text(audioName, 300, 240);

      if (count >= 10) {//once the space bar has been pressed 10 times
        textSize(30);
        text("The BPM is " + bpm + ".", 350, 380);
        audio.stop();//the audio is stopped 
        playButton.remove();
        pauseButton.remove();
        stopButton.remove();//the play, pause, and stop buttons are removed
        fft.setInput(audio);//the fft object is set to accept the audio as an input
        setTimeout(loadNote, 1500);//goes to the loadNote() method after 1.5 seconds (1500 milliseconds)
      } else {
        count++;//the count (how many times the space bar has been pressed) is incremented after each spacebar press
      }
    }
  }
}

function play() {//the play() method loops the audio as it could be too short to just play once
  audio.loop();
}

function pause() {//the pause() method pauses the the audio at the current time
  audio.pause();
}

function stop() {//the stop() method stops the audio
  audio.stop();
}

function playSong() {//the playSong() method is called to create the play, pause, and stop buttons
  playButton = createButton("Play");
  pauseButton = createButton("Pause");
  stopButton = createButton("Stop");
  playButton.position(350, 280);
  pauseButton.position(400, 280);
  stopButton.position(460, 280);
  playButton.mousePressed(play);
  stopButton.mousePressed(stop);
  pauseButton.mousePressed(pause);
}


function loadNote() {//this method is the start of the frequency analysis
  clear();
  backButton.remove();
  background(130, 163, 154);
  textSize(50);
  text("Analyzing frequency ... .. .", 180, 300);
  audio.connect(fft);//the fft is again connected to the audio
  audio.play();//the audio is played in order to analyze the audio
  start = millis();//the start time of the analysis is stored into start
  chosen = 3;// the chosen variable is set to 3 so that the draw method is able to continuously check the frequency of the audio
}

function convert() {//this method converts the frequecies stored in the nodes within the LinkedList to their corresponding note names
  clear();
  background(130, 163, 154);
  textSize(50);
  text("Finding notes ... .. .", 230, 300);
  var currNode = noteList.head;
  var unidentified = 0;

  while (currNode) {//while the current node is not null

    if (currNode.data.type <= noteFreq[noteFreq.length - 1] && currNode.data.type >= noteFreq[0]) {//if type (frequency) is within the frequency identification range of the software
      for (var index = 0; index < noteArray.length; index++) {
//implement a linear search to look for when the type (frequeny) is between two indexs
        if (currNode.data.type >= noteFreq[index] && currNode.data.type <= noteFreq[index + 1]) {
          if (currNode.data.type - noteFreq[index] <= noteFreq[index + 1] - currNode.data.type) {//checks which frequency the type (frequency) of the current node is closer to
            currNode.data.type = noteArray[index];//updates the current nodes type to the note name at the corresponding index in the note name array

          } else {
            currNode.data.type = noteArray[index + 1];//if the note is closer to the next frequency then the note name is the corresponding index in the note name array 

          }
        }
      }
    } else if (currNode.data.type >= (noteFreq[0] - 4.5) && currNode.data.type < noteFreq[0]) {//if the type (frequency) of the note is the lowest one
      currNode.data.type = noteArray[0];//the type of the node is updated to the lowest note

    } else if (currNode.data.type >= (noteFreq[noteFreq.length - 1]) && currNode.data.type < (noteFreq[noteFreq.length] + 25)) {//if the type (frequency) is the highest note in the range
      currNode.data.type = noteArray[noteFreq.length - 1];//the type of the node is updated to the highest note

    } else if (currNode.data.type == 0) {
      currNode.data.type = "rest";//if the type is zero, the node's type is set to "rest"

    } else {//if the note's type is not within the range then the type is changed to "?"
      currNode.data.type = "?";
    }

    currNode = currNode.next;//the current node is updated to the next
  }
  organize();//once the entire LinkedList is iterated over, then call the organize method
}

function organize() {
  clear();
  background(130, 163, 154);
  textSize(50);
  text("Organizing ... .. .", 260, 300);

  notes = [];//these two arrays are used to organize the display
  times = [];
  var currNode = noteList.head;
  var index = 0;

  while (currNode) {//while the current node is not null

    if (index == 0) {//the first index is merely set as the current nodes type and length
      notes[index] = currNode.data.type;
      times[index] = round(currNode.data.length, 2);

    } else if (!noteList.getLast()) {//if the last node is not reached

      if (currNode.data.type == currNode.next.data.type) {//check if current nodes type is the same as the next nodes, if that is true only update the length of the last index as the type (notes) are the same
        index--;
        times[index] = round(currNode.data.length, 2);

      } else {//if the types are different then add the type and length to the index
        notes[index] = currNode.data.type;
        times[index] = round(currNode.data.length, 2);

      }
    } else if (noteList.getLast()) {//if the last node is reached
      if (currNode.data.type == notes[notes.length - 1]) {//if the note hasn't changed
        index--;
        times[index] = round(currNode.data.length, 2);//only update the length of the last index

      } else {//if not add the type and length to the index
        notes[index] = currNode.data.type;
        times[index] = round(currNode.data.time, 2);

      }
    }

    currNode = currNode.next;
    index++;//increment the current node and the index
  }

  simplify();//once the list is iterated over, call the simplify() method

}

function simplify() {//in some cases the length is not a number because of the continuous iterations in the draw method 
  background(130, 163, 154);
  textSize(50);
  text("Simplifying ... .. .", 260, 300);

  var currIndex = 0;
  var lengthArray = notes.length;

  while (currIndex < lengthArray) {//iterate over the times and notes arrays to look for the non numerical values

    if (notNum(times[currIndex])) {//if the length is not a number, then delete the current index
      times.splice(currIndex, 1);
      notes.splice(currIndex, 1);
      lengthArray--;
      currIndex--;
    }
    currIndex++;
  }

  noteLength();//calls noteLength() once completed
}


function notNum(value) {//this evaluates if the value is a numerical data
  var n = Number(value);//the value is converted as to a number
  return n !== n;//returns true or false

}

function noteLength() {//noteLength() calculates the note length values

  background(130, 163, 154);
  textSize(50);
  text("Note lengths ... .. .", 260, 300);
  var bps = bpm / 60;//bps is the bpm divided by 60 (minutes converted to seconds)

  lengths = [];
  var currIndex = 0;
  var notesLength;//this is the duration of notes

  while (currIndex < times.length) {//iterates over the times array

    if (currIndex == 0) {//calculates the duration of a note
      notesLength = times[currIndex];
    } else {
      notesLength = times[currIndex] - times[currIndex - 1];
    }

    //the following conditionals are calculations to check if a note is close to a whole, half, quarter, eigth, or sixteenth note. If none of these are found, set the note length to "?" to denote that it's unknown
    if (notesLength >= (4 / bps - 0.1) && notesLength <= (4 / bps + 0.1)) {
      lengths[currIndex] = "Whole note";
    } else if (notesLength >= (2 / bps - 0.1) && notesLength <= (2 / bps + 0.1)) {
      lengths[currIndex] = "Half note";
    } else if (notesLength >= (1 / bps - 0.1) && notesLength <= (1 / bps + 0.1)) {
      lengths[currIndex] = "Quarter note";
    } else if (notesLength >= (1 / (bps * 2) - 0.1) && notesLength <= (1 / (bps * 2) + 0.1)) {
      lengths[currIndex] = "Eigth note";
    } else if (notesLength >= (1 / (bps * 4) - 0.1) && notesLength <= (1 / (bps * 4) + 0.1)) {
      lengths[currIndex] = "Sixteenth note";
    } else {
      lengths[currIndex] = "?"
    }

    currIndex++;
  }

  display();//display is called

}

function display() {//this method displays the product of the analysis

  clear();
  if (notes.length > 9) {//if there are more than 9 notes then the canvas is resized to accomodate all the notes
    var canvasY = 600 + 55 * (notes.length - 10);
    createCanvas(790, canvasY);
  }


  background(130, 163, 154);

  textSize(25);
  text("Notes", 150, 150);
  text("Played up to (s)", 320, 150);
  text("Note length", 570, 150);

  line(120, 160, 730, 160);//these are displaying preferences

  var currInd = 0;
  var y = 195;//the initial y value is 195

  while (currInd < notes.length) {//iterate through the array and displays the values in the notes', times', and lengths' current indexes
    text(notes[currInd], 167, y);
    text(times[currInd], 375, y);
    text(lengths[currInd], 570, y);

    y = y + 45;
    currInd++;//increments the current index
  }
  line(280, 130, 280, y);
  line(540, 130, 540, y);

  save('Notes.jpg');//saves the canvas as a jpg file
}


/*
  https://stackoverflow.com/questions/50376861/how-to-get-frequency-value-in-javascript/50421601

*/
