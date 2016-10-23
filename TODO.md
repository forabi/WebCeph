TODO
=======
* [ ] Tests
  * [ ] Test for logic:
    * [ ] Steps
    * [ ] Calculation of angles
    * [ ] Mapping of landmarks
  * [ ] Tests for analysis
    * [ ] Test interpretations
    * [ ] Test components exist
  * [ ] Tests for UI
    * [ ] Unit tests
    * [ ] Integration tests
    * [ ] Jest?
  * [ ] CI
* [x] Fix setting points and landmarks relative to current canvas size
* [ ] Performance
  * [ ] Service worker
  * [ ] HTTP/2
  * [ ] Bundling?
  * [ ] Investigate handling some redux action using a rAF scheduler?
* [ ] Namespaces
* [ ] Typings for reducers
* [ ] Selectors with corresponding reducers in one file
* [ ] Tracing modes: manual, assisted, automatic
* [ ] Command palette
* [ ] Redesign
* [ ] Send manual tracing data to dev server in `__DEBUG__` mode, save to database
  * [ ] Only when "Show results" clicked?
  * [ ] Save:
    * [ ] Date and time
    * [ ] Hash of file?
      * [ ] How?
    * [ ] Symbol
    * [ ] Analysis name
* [ ] Draggable points
* [ ] Remove step
* [ ] Edit step
* [ ] Labels for landmarks
* [ ] Extend lines for angle intersection, draw arcs for angles
* [ ] Batch addManualLandmarks
* [ ] Display units in steps and results
* [ ] Fix contrast, brightness and invert filters
* [x] Undo/redo
* [ ] Mutltiple tools
  * [ ] Point
  * [ ] Line
  * [ ] Zoom in/out
    * [ ] transform="scale(scale, scale) translate((x/scale - x), (y/scale - y)) translate((width/scale - width) / 2, (height/scale - height) / 2)"
  * [ ] Later: freeform drawing tool?
  * [ ] Change cursor accordingly
    * [ ] Use SVG for cursor?
* [ ] UX
  * [ ] Scroll current step into view
* [x] Highlight geometrical object on step hover
* [ ] Highlight step on object hover
* [ ] Rename object
* [ ] Keyboard shortucts
* [ ] Analyses
  * [ ] Do not store entire analysis in store
  * [ ] Ability to switch analysis
  * [ ] Predefined
    * [ ] Basic
      * [ ] SNA, SNB, ANB
      * [ ] Growth pattern
        * [ ] Bjork
        * [ ] Y axis
      * [ ] FMA
      * [ ] Angle of convexity
    * [ ] Downs
      * [x] SNA, SNB, ANB
      * [x] FMA
      * [x] Angle of convexity
      * [ ] Facial Angle
      * [ ] Y Axis
      * [ ] A-B Plane Angle
      * [ ] Cant of Occlusal Plane
      * [ ] Inter-Incisal Angle
      * [ ] Incisor Occlusal Plane Angle
      * [ ] Incisor Mandibular Plane Angle
      * [ ] U1 to A-Pog Line
    * [ ] Steiner
    * [ ] Wits
    * [ ] Tweed
      * [ ] IMPA
      * [ ] FMIA
      * [ ] FMA
  * [ ] Custom
  * [x] Show steps
  * [x] Walk through steps
  * [ ] Test getStepsForAnalysis
    * [ ] Should not repeat lines i.e. S-N, N-S
  * [ ] Line -> Vector
  * [ ] GeometricalVector
  * [x] GeometricalAngle
  * [ ] Scale factor
  * [ ] Calculate severity properly
* [ ] Persist some parts of the state
  * [ ] Compatiblity checks?
    * [ ] How to handle browser updates? 
* [ ] Export
  * [ ] Results as image
  * [ ] Canvas as image
  * [ ] Custom file format (manual landmarks, image corrections...)
    * [ ] Embed image?
  * [ ] Printing (nice to have)
* [x] Automatic resizing of canvas (use transform: scale?)
* [ ] Detect and show what image types are supported
* [ ] Tell user if dropped image is not supported
* [ ] Nice to have: support for DICOM images
* [ ] Nice to have: 