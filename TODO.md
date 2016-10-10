TODO
=======
[ ] Tests
  [ ] Test for logic:
    [ ] Steps
    [ ] Calculation of angles
    [ ] Mapping of landmarks
  [ ] Tests for analysis
    [ ] Test interpretations
    [ ] Test components exist
  [ ] Tests for UI
    [ ] Unit tests
    [ ] Integration tests
    [ ] Jest?
  [ ] CI
[ ] Namespaces
[ ] Typings for reducers
[ ] Selectors with corresponding reducers in one file
[ ] Batch addManualLandmarks
[ ] Display units in steps and results
[ ] Fix contrast, brightness and invert filters
[ ] Undo/redo
[ ] Mutltiple tools
  [ ] Point
  [ ] Line
  [ ] Zoom in/out
  [ ] Later: freeform drawing tool?
  [ ] Change cursor accordingly
    [ ] Use SVG for cursor?
[ ] Highlight geometrical object on step hover
[ ] Highlight step on object hover
[ ] Remove step, edit step
[ ] Show object label
[ ] Rename object
[ ] Keyboard shortucts
[ ] Analyses
  [ ] Do not store entire anlysis in store
  [ ] Ability to switch analysis
  [ ] Predfined
    [ ] Basic
      [ ] SNA, SNB, ANB
      [ ] Growth pattern
        [ ] Bjork
        [ ] Y axis
      [ ] FMA
      [ ] Angle of convexity
    [ ] Downs
      [x] SNA, SNB, ANB
      [x] FMA
      [x] Angle of convexity
      [ ] Facial Angle
      [ ] Y Axis
      [ ] A-B Plane Angle
      [ ] Cant of Occlusal Plane
      [ ] Inter-Incisal Angle
      [ ] Incisor Occlusal Plane Angle
      [ ] Incisor Mandibular Plane Angle
      [ ] U1 to A-Pog Line
    [ ] Steiner
    [ ] Wits
    [ ] Tweed
      [ ] IMPA
      [ ] FMIA
      [ ] FMA
  [ ] Custom
  [x] Show steps
  [x] Walk through steps
  [ ] Test getStepsForAnalysis
    [ ] Should not repeat lines i.e. S-N, N-S
  [ ] Line -> Vector
  [ ] GeometricalVector
  [x] GeometricalAngle
  [ ] Scale factor
  [ ] Calculate severity properly
[ ] Persiste some parts of the state
  [ ] Compatiblity checks?
    [ ] How to handle browser updates? 
[ ] Automatic resizing of canvas (use transform: scale?)
[ ] Detect and show what image types are supported
[ ] Tell user if dropped image is not supported
[ ] Nice to have: support for DICOM images