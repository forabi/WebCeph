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
  * [ ] Memoize functions if possible
  * [ ] requestAnimationFrame
  * [ ] Throttle function calls?
  * [ ] Identify potential bottlenecks
  * [ ] Offload to workers if possible
  * [ ] requresIdleCallback if cannot offload to a worker?
    * [ ] Polyfill? Good idea?
  * [ ] 
  * [x] Service worker
  * [x] HTTP/2
  * [ ] Bundling?
  * [ ] Investigate handling some redux action using a rAF scheduler?
* [ ] Namespaces
* [x] Typings for reducers
* [x] Selectors with corresponding reducers in one file
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
* [ ] Internationalization
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
  * [x] Point
  * [ ] Line
  * [ ] Zoom in/out
    * [ ] transform="scale(scale, scale) translate((x/scale - x), (y/scale - y)) translate((width/scale - width) / 2, (height/scale - height) / 2)"
  * [ ] Later: freeform drawing tool?
  * [x] Change cursor accordingly
    * [x] Use SVG for cursor?
* [ ] UX
  * [x] Scroll current step into view
  * [ ] Meaningful animations
* [x] Highlight geometrical object on step hover
* [ ] Highlight step on object hover
* [ ] Rename object
* [ ] Keyboard shortucts
* [ ] Analyses
  * [x] Do not store entire analysis in store
  * [x] Ability to switch analysis
  * [ ] Predefined
    * [ x] Basic
      * [x] SNA, SNB, ANB
      * [x] Growth pattern
        * [x] Bjork
        * [x] Y axis
      * [x] FMA
      * [ ] Angle of convexity
    * [x] Downs
      * [x] SNA, SNB, ANB
      * [x] FMA
      * [x] Angle of convexity
      * [x] Facial Angle
      * [x] Y Axis
      * [x] A-B Plane Angle
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
  * [x] GeometricalVector
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