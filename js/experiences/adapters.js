function createNoopExperienceAdapter() {
  return Object.freeze({
    bindEvents: function() {}
  });
}

window.EXPERIENCE_ADAPTERS = Object.freeze({
  stitching: window.stitchingExperienceAdapter || createNoopExperienceAdapter(),
  triangula: window.triangulaExperienceAdapter || createNoopExperienceAdapter(),
  squarus: window.squarusExperienceAdapter || createNoopExperienceAdapter(),
  mashrabiya: window.mashrabiyaExperienceAdapter || createNoopExperienceAdapter()
});
