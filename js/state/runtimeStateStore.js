window.createRuntimeStateStore = function createRuntimeStateStore(initialState) {
  var state = Object.assign(
    {
      experienceId: 'stitching',
      shape: 'circle',
      bpm: 84,
      songId: 'bach',
      musicMuted: false
    },
    initialState || {}
  );

  function reduce(current, action) {
    var next = Object.assign({}, current);
    if (!action || !action.type) return next;

    if (action.type === 'SET_EXPERIENCE') {
      var nextExperience = action.payload && action.payload.experienceId;
      if (nextExperience) {
        next.experienceId = nextExperience;
      }
      return next;
    }

    if (action.type === 'SET_SHAPE') {
      var nextShape = action.payload && action.payload.shape;
      if (nextShape) {
        next.shape = nextShape;
      }
      return next;
    }

    if (action.type === 'SET_TEMPO') {
      var nextBpm = action.payload && action.payload.bpm;
      if (isFinite(nextBpm)) {
        next.bpm = Number(nextBpm);
      }
      return next;
    }

    if (action.type === 'SET_SONG') {
      var nextSongId = action.payload && action.payload.songId;
      if (nextSongId) {
        next.songId = nextSongId;
      }
      return next;
    }

    if (action.type === 'SET_MUSIC_MUTED') {
      next.musicMuted = !!(action.payload && action.payload.musicMuted);
      return next;
    }

    if (action.type === 'HYDRATE_URL_META') {
      var urlExperience = action.payload && action.payload.experienceId;
      var urlShape = action.payload && action.payload.shape;
      var urlBpm = action.payload && action.payload.bpm;
      var urlSongId = action.payload && action.payload.songId;
      var urlMusicMuted = action.payload && action.payload.musicMuted;
      if (urlExperience) {
        next.experienceId = urlExperience;
      }
      if (urlShape) {
        next.shape = urlShape;
      }
      if (isFinite(urlBpm)) {
        next.bpm = Number(urlBpm);
      }
      if (urlSongId) {
        next.songId = urlSongId;
      }
      if (typeof urlMusicMuted === 'boolean') {
        next.musicMuted = urlMusicMuted;
      }
      return next;
    }

    return next;
  }

  return {
    getState: function() {
      return Object.assign({}, state);
    },
    dispatch: function(action) {
      state = reduce(state, action);
      return state;
    }
  };
};
