/* Group 4 results: fill in after the fieldwork (after 10 Dec). The Predictions page reads this file.

   For every variable, give the plot mean of the statistic named on the Predictions page:
     'N-C': 812            one number (the plot mean), or
     'N-C': [812, 95]      the plot mean and the spread between the loggers or replicates of that plot (for example the SD).
   Leave null where nothing is measured yet. Use the same unit for all four plots; the page compares
   directions (which plot is higher), so raw TOMST moisture counts work as well as calibrated values.

   Microclimate: H1 is tested on clear days, so use clear-day means and say so in "note".
   Each combination of aspect and forest type is one stand: the page compares four stands, it does not test effects. */
window.G4_RESULTS = {
  note: '',   // for example 'Microclimate: means of the 5 clear days, 27 Nov – 9 Dec. Soil: 3 Dec, 4 replicates per plot.'

  open:  { unit: '%',   'N-C': null, 'N-D': null, 'S-C': null, 'S-D': null },  // canopy openness, GLAMA, mean of the 2 photos
  lgt:   { unit: 'lux', 'N-C': null, 'N-D': null, 'S-C': null, 'S-D': null },  // light at the floor, HOBO Pendant 2 m, daytime mean
  tair:  { unit: 'K',   'N-C': null, 'N-D': null, 'S-C': null, 'S-D': null },  // air temperature daily range at 1 m, HOBO Pro v2
  tsur:  { unit: 'K',   'N-C': null, 'N-D': null, 'S-C': null, 'S-D': null },  // surface temperature daily range at +2 cm, TOMST
  tsoil: { unit: 'K',   'N-C': null, 'N-D': null, 'S-C': null, 'S-D': null },  // topsoil temperature daily range at −6 cm, TOMST
  rh:    { unit: '%',   'N-C': null, 'N-D': null, 'S-C': null, 'S-D': null },  // relative humidity at 1 m, daily mean, HOBO Pro v2
  smo:   { unit: '%',   'N-C': null, 'N-D': null, 'S-C': null, 'S-D': null },  // soil moisture 0–15 cm, daily mean, TOMST
  ohz:   { unit: 'cm',  'N-C': null, 'N-D': null, 'S-C': null, 'S-D': null },  // O-horizon thickness (L + Of + Oh), mean of the 4 points
  ph1:   { unit: '',    'N-C': null, 'N-D': null, 'S-C': null, 'S-D': null },  // pH (CaCl₂) of the upper depth (0–5 cm), mean of 4 replicates
  ph2:   { unit: '',    'N-C': null, 'N-D': null, 'S-C': null, 'S-D': null }   // pH (CaCl₂) of the lower depth (5–15 cm), mean of 4 replicates
};
