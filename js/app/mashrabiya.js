function getMashrabiyaStarJump(fold) {
  var safeFold = sanitizeMashrabiyaFold(fold, 12);
  if (safeFold === 8) return 3;
  if (safeFold === 6) return 5;
  return 5;
}
function buildMashrabiyaStepSequence(pointCount, startIndex, jumpValue) {
  var n = parseBoundedInt(pointCount, 3, MAX_HOLES, 12);
  var start = ((parseInt(startIndex, 10) % n) + n) % n;
  var jump = ((parseInt(jumpValue, 10) % n) + n) % n;
  if (!jump) jump = 1;

  var sequence = [];
  var visited = new Array(n).fill(false);
  var current = start;
  var safety = n * 4;

  for (var i = 0; i < safety; i++) {
    if (visited[current]) break;
    visited[current] = true;
    sequence.push(current);
    current = (current + jump) % n;
  }

  return sequence;
}

function buildMashrabiyaRosetteGeometry(fold, geometryMode) {
  var safeFold = sanitizeMashrabiyaFold(fold, 12);
  var safeGeometryMode = sanitizeMashrabiyaGeometryMode(geometryMode, mashrabiyaGeometryMode);
  var center = view.center;
  var radius = Math.max(120, Math.min(view.size.width, view.size.height) * 0.42);
  var angleStep = (Math.PI * 2) / safeFold;
  var petalRadius = radius * 0.93;
  var bridgeRadius = radius * 0.67;

  function pointAt(theta, r) {
    return new Point(
      center.x + r * Math.cos(theta),
      center.y + r * Math.sin(theta)
    );
  }

  var petalTips = [];
  var scaffoldPoints = [];
  var bridgePoints = [];
  var guideCircleVertices = [];
  var innerGuideCircleVertices = [];

  var circleSampleCount = 180;
  for (var sample = 0; sample < circleSampleCount; sample++) {
    var circleAngle = -Math.PI / 2 + ((Math.PI * 2 * sample) / circleSampleCount);
    guideCircleVertices.push(pointAt(circleAngle, petalRadius));
  }

  for (var i = 0; i < safeFold; i++) {
    var baseAngle = -Math.PI / 2 + i * angleStep;
    var halfAngle = baseAngle + (angleStep / 2);
    petalTips.push(pointAt(baseAngle, petalRadius));
    bridgePoints.push(pointAt(halfAngle, bridgeRadius));
  }

  // Dense lifted stitch-vertex construction for rosette folds.
  // 6-fold uses 96 points to preserve the intended hexagon + projected-thread geometry.
  var scaffoldCount = (safeFold === 6) ? 96 : (safeFold * 8);
  var scaffoldAngleStep = (Math.PI * 2) / scaffoldCount;
  var scaffoldRadius = petalRadius;
  var scaffoldPhase = -Math.PI / 2;

  for (var si = 0; si < scaffoldCount; si++) {
    scaffoldPoints.push(pointAt(scaffoldPhase + si * scaffoldAngleStep, scaffoldRadius));
  }

  // Keep the rendered circle guide on the same vertex set as stitched sequences,
  // so thread endpoints visually sit on the circle instead of appearing outside.
  guideCircleVertices = scaffoldPoints.slice();

  var circleSequence = buildMashrabiyaStepSequence(scaffoldCount, 0, 1);
  var firstPolygonSequence = buildMashrabiyaStepSequence(scaffoldCount, 0, 16);
  var offsetPolygonSequence = buildMashrabiyaStepSequence(scaffoldCount, 8, 16);
  var starJump = Math.max(1, Math.round(scaffoldCount / 2) - 4);
  var starSequence = buildMashrabiyaStepSequence(scaffoldCount, 2, starJump);
  var starThreadSegments = buildTaggedSegmentsFromSequence(scaffoldPoints, starSequence, 'thread3');

  function getCircleIntersectionsForInfiniteLine(lineStart, lineEnd, circleCenter, circleRadius) {
    var direction = lineEnd.subtract(lineStart);
    var a = direction.dot(direction);
    if (a <= 1e-8) return [];
    var f = lineStart.subtract(circleCenter);
    var b = 2 * f.dot(direction);
    var c = f.dot(f) - (circleRadius * circleRadius);
    var discriminant = (b * b) - (4 * a * c);
    if (discriminant < 0) return [];

    var sqrtDisc = Math.sqrt(Math.max(0, discriminant));
    var t1 = (-b - sqrtDisc) / (2 * a);
    var t2 = (-b + sqrtDisc) / (2 * a);
    var hits = [lineStart.add(direction.multiply(t1))];
    if (Math.abs(t2 - t1) > 1e-8) {
      hits.push(lineStart.add(direction.multiply(t2)));
    }
    return hits;
  }

  function getOuterProjectionPairForRosetteSegment(fromPoint, toPoint) {
    var direction = toPoint.subtract(fromPoint);
    var segmentLength = direction.length;
    if (segmentLength <= 0.001) {
      return { fromHit: null, toHit: null };
    }
    var unit = direction.normalize(1);
    var hits = getCircleIntersectionsForInfiniteLine(fromPoint, toPoint, center, scaffoldRadius);
    if (!hits.length) {
      return { fromHit: null, toHit: null };
    }

    var fromHit = null;
    var toHit = null;
    var bestBefore = -Infinity;
    var bestAfter = Infinity;
    var minT = Infinity;
    var maxT = -Infinity;
    var minPoint = null;
    var maxPoint = null;

    for (var i = 0; i < hits.length; i++) {
      var t = hits[i].subtract(fromPoint).dot(unit);
      if (t < minT) {
        minT = t;
        minPoint = hits[i];
      }
      if (t > maxT) {
        maxT = t;
        maxPoint = hits[i];
      }
      if (t < -1e-4 && t > bestBefore) {
        bestBefore = t;
        fromHit = hits[i];
      }
      if (t > segmentLength + 1e-4 && t < bestAfter) {
        bestAfter = t;
        toHit = hits[i];
      }
    }

    if (!fromHit) fromHit = minPoint;
    if (!toHit) toHit = maxPoint;

    return {
      fromHit: fromHit,
      toHit: toHit
    };
  }

  function buildProjectedSegmentsFromInnerSequence(innerPoints, innerSequence) {
    var segments = [];
    for (var i = 0; i < innerSequence.length; i++) {
      var fromInner = innerPoints[innerSequence[i]];
      var toInner = innerPoints[innerSequence[(i + 1) % innerSequence.length]];
      if (!fromInner || !toInner || fromInner.getDistance(toInner) <= 1e-6) continue;

      var projection = getOuterProjectionPairForRosetteSegment(fromInner, toInner);
      if (projection.fromHit && projection.fromHit.getDistance(fromInner) > 1e-6) {
        segments.push({ from: projection.fromHit, to: fromInner, tag: 'thread3', edgeIndex: segments.length });
      }
      segments.push({ from: fromInner, to: toInner, tag: 'thread3', edgeIndex: segments.length });
      if (projection.toHit && projection.toHit.getDistance(toInner) > 1e-6) {
        segments.push({ from: toInner, to: projection.toHit, tag: 'thread3', edgeIndex: segments.length });
      }
    }
    return segments;
  }

  function buildInnerScaffoldRing(innerCount, innerRatio) {
    var points = [];
    var count = Math.max(3, parseBoundedInt(innerCount, 3, MAX_HOLES, Math.round(scaffoldCount * 0.5)));
    var ratio = Math.max(0.1, Math.min(0.95, isFinite(innerRatio) ? innerRatio : 0.5));
    var innerRadius = scaffoldRadius * ratio;
    for (var i = 0; i < count; i++) {
      points.push(pointAt(scaffoldPhase + i * ((Math.PI * 2) / count), innerRadius));
    }
    return points;
  }

  if (safeFold === 12 && scaffoldCount === 96) {
    var rosetteInnerRatio = 0.5;
    var rosetteInnerCount = 48;
    var rosetteInnerRadius = scaffoldRadius * rosetteInnerRatio;
    var innerScaffoldPoints = [];
    for (var ip = 0; ip < rosetteInnerCount; ip++) {
      innerScaffoldPoints.push(pointAt(scaffoldPhase + ip * ((Math.PI * 2) / rosetteInnerCount), rosetteInnerRadius));
    }
    innerGuideCircleVertices = innerScaffoldPoints.slice();

    var thread3InnerSequence = buildMashrabiyaStepSequence(rosetteInnerCount, 2, 20);
    starSequence = thread3InnerSequence.slice();
    starJump = 20;
    starThreadSegments = buildProjectedSegmentsFromInnerSequence(innerScaffoldPoints, thread3InnerSequence);
  } else if (safeFold === 8 && scaffoldCount === 64) {
    var rosette8InnerPoints = buildInnerScaffoldRing(32, 0.5);
    innerGuideCircleVertices = rosette8InnerPoints.slice();
    var thread3InnerSequence8 = buildMashrabiyaStepSequence(rosette8InnerPoints.length, 2, 20);
    starSequence = thread3InnerSequence8.slice();
    starJump = 20;
    starThreadSegments = buildProjectedSegmentsFromInnerSequence(rosette8InnerPoints, thread3InnerSequence8);
  } else if (safeFold === 6 && scaffoldCount === 96) {
    // 6-fold uses one outer hexagon (start 1, step 16), then three projected inner threads.
    firstPolygonSequence = buildMashrabiyaStepSequence(scaffoldCount, 0, 16);
    offsetPolygonSequence = [];

    var rosette6InnerPoints = buildInnerScaffoldRing(48, 0.5);
    innerGuideCircleVertices = rosette6InnerPoints.slice();
    var rosette6Starts = [3, 5, 7]; // start holes 4, 6, 8 in 1-based indexing
    starThreadSegments = [];

    for (var rs = 0; rs < rosette6Starts.length; rs++) {
      var sequence6 = buildMashrabiyaStepSequence(rosette6InnerPoints.length, rosette6Starts[rs], 18);
      if (!starSequence || !starSequence.length) {
        starSequence = sequence6.slice();
      }
      var projected = buildProjectedSegmentsFromInnerSequence(rosette6InnerPoints, sequence6);
      for (var ps = 0; ps < projected.length; ps++) {
        projected[ps].edgeIndex = starThreadSegments.length;
        starThreadSegments.push(projected[ps]);
      }
    }

    starJump = 18;
  }

  function buildLegacyFillGeometry(starVertices) {
    var legacyPetals = [];
    var legacyPointRegions = [];
    for (var k = 0; k < safeFold; k++) {
      var kPrev = (k - 1 + safeFold) % safeFold;
      legacyPetals.push([petalTips[k], bridgePoints[k], bridgePoints[kPrev]]);
      var starVertex = starVertices[k % starVertices.length];
      legacyPointRegions.push([bridgePoints[kPrev], bridgePoints[k], starVertex]);
    }
    return {
      petals: legacyPetals,
      pointRegions: legacyPointRegions
    };
  }

  function buildSegmentsFromSequence(pointsList, sequence) {
    var segments = [];
    for (var idx = 0; idx < sequence.length; idx++) {
      var aIndex = sequence[idx];
      var bIndex = sequence[(idx + 1) % sequence.length];
      var aPoint = pointsList[aIndex];
      var bPoint = pointsList[bIndex];
      if (!aPoint || !bPoint || aPoint.getDistance(bPoint) <= 1e-6) continue;
      segments.push({
        from: aPoint,
        to: bPoint,
        edgeIndex: idx
      });
    }
    return segments;
  }

  function buildSegmentsFromClosedVertices(vertices, tag) {
    var segments = [];
    for (var idx = 0; idx < vertices.length; idx++) {
      var aPoint = vertices[idx];
      var bPoint = vertices[(idx + 1) % vertices.length];
      if (!aPoint || !bPoint || aPoint.getDistance(bPoint) <= 1e-6) continue;
      segments.push({
        from: aPoint,
        to: bPoint,
        tag: tag || 'line',
        edgeIndex: idx
      });
    }
    return segments;
  }

  function buildTaggedSegmentsFromSequence(pointsList, sequence, tag) {
    var raw = buildSegmentsFromSequence(pointsList, sequence);
    for (var idx = 0; idx < raw.length; idx++) {
      raw[idx].tag = tag || 'line';
    }
    return raw;
  }

  function segmentIntersection(segA, segB) {
    var p = segA.from;
    var p2 = segA.to;
    var q = segB.from;
    var q2 = segB.to;
    var r = p2.subtract(p);
    var s = q2.subtract(q);
    var denom = r.cross(s);
    if (Math.abs(denom) <= 1e-6) return null;

    var qp = q.subtract(p);
    var t = qp.cross(s) / denom;
    var u = qp.cross(r) / denom;
    var epsilon = 1e-6;
    if (t < -epsilon || t > (1 + epsilon) || u < -epsilon || u > (1 + epsilon)) {
      return null;
    }

    return {
      point: p.add(r.multiply(t)),
      t: t,
      u: u
    };
  }

  function dedupePointsByDistance(pointsList, threshold) {
    var deduped = [];
    var minDistance = Math.max(0.25, threshold || 0.75);
    for (var di = 0; di < pointsList.length; di++) {
      var candidate = pointsList[di];
      var exists = false;
      for (var dj = 0; dj < deduped.length; dj++) {
        if (candidate.getDistance(deduped[dj]) <= minDistance) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        deduped.push(candidate);
      }
    }
    return deduped;
  }

  function buildStarInnerVertices(pointsList, starSequence) {
    var segments = buildSegmentsFromSequence(pointsList, starSequence);
    var intersections = [];

    for (var a = 0; a < segments.length; a++) {
      for (var b = a + 1; b < segments.length; b++) {
        if (Math.abs(segments[a].edgeIndex - segments[b].edgeIndex) <= 1) continue;
        if ((segments[a].edgeIndex === 0 && segments[b].edgeIndex === segments.length - 1) ||
            (segments[b].edgeIndex === 0 && segments[a].edgeIndex === segments.length - 1)) {
          continue;
        }
        var hit = segmentIntersection(segments[a], segments[b]);
        if (hit && hit.point) {
          intersections.push(hit.point);
        }
      }
    }

    intersections = dedupePointsByDistance(intersections, radius * 0.008);
    if (!intersections.length) return [];

    intersections.sort(function(left, right) {
      return left.getDistance(center) - right.getDistance(center);
    });

    var innerVertices = intersections.slice(0, safeFold);
    innerVertices.sort(function(left, right) {
      var leftAngle = Math.atan2(left.y - center.y, left.x - center.x);
      var rightAngle = Math.atan2(right.y - center.y, right.x - center.x);
      return leftAngle - rightAngle;
    });

    return innerVertices;
  }

  function normalizeParam(value) {
    return Math.max(0, Math.min(1, value));
  }

  function addSplitValue(values, candidate, epsilon) {
    var eps = isFinite(epsilon) ? epsilon : 1e-5;
    var normalized = normalizeParam(candidate);
    for (var i = 0; i < values.length; i++) {
      if (Math.abs(values[i] - normalized) <= eps) return;
    }
    values.push(normalized);
  }

  function sortNumeric(values) {
    values.sort(function(a, b) {
      return a - b;
    });
    return values;
  }

  function getPointOnSegment(segment, t) {
    var ratio = normalizeParam(t);
    return segment.from.add(segment.to.subtract(segment.from).multiply(ratio));
  }

  function polygonSignedArea(vertices) {
    if (!vertices || vertices.length < 3) return 0;
    var sum = 0;
    for (var i = 0; i < vertices.length; i++) {
      var a = vertices[i];
      var b = vertices[(i + 1) % vertices.length];
      sum += (a.x * b.y) - (b.x * a.y);
    }
    return sum * 0.5;
  }

  function polygonCentroid(vertices) {
    if (!vertices || !vertices.length) return center;
    var areaFactor = 0;
    var cx = 0;
    var cy = 0;

    for (var i = 0; i < vertices.length; i++) {
      var a = vertices[i];
      var b = vertices[(i + 1) % vertices.length];
      var cross = (a.x * b.y) - (b.x * a.y);
      areaFactor += cross;
      cx += (a.x + b.x) * cross;
      cy += (a.y + b.y) * cross;
    }

    if (Math.abs(areaFactor) <= 1e-8) {
      var avgX = 0;
      var avgY = 0;
      for (var j = 0; j < vertices.length; j++) {
        avgX += vertices[j].x;
        avgY += vertices[j].y;
      }
      return new Point(avgX / vertices.length, avgY / vertices.length);
    }

    var scale = 1 / (3 * areaFactor);
    return new Point(cx * scale, cy * scale);
  }

  function vertexKey(point) {
    return String(Math.round(point.x * 1000)) + '|' + String(Math.round(point.y * 1000));
  }

  function extractFacesFromSegments(baseSegments) {
    if (!baseSegments || !baseSegments.length) return [];

    var splitParams = [];
    for (var i = 0; i < baseSegments.length; i++) {
      splitParams.push([0, 1]);
    }

    for (var a = 0; a < baseSegments.length; a++) {
      for (var b = a + 1; b < baseSegments.length; b++) {
        var hit = segmentIntersection(baseSegments[a], baseSegments[b]);
        if (!hit) continue;
        addSplitValue(splitParams[a], hit.t, 1e-5);
        addSplitValue(splitParams[b], hit.u, 1e-5);
      }
    }

    var undirectedEdges = [];
    for (var s = 0; s < baseSegments.length; s++) {
      var params = sortNumeric(splitParams[s]);
      for (var p = 0; p < params.length - 1; p++) {
        var t0 = params[p];
        var t1 = params[p + 1];
        if ((t1 - t0) <= 1e-5) continue;
        var from = getPointOnSegment(baseSegments[s], t0);
        var to = getPointOnSegment(baseSegments[s], t1);
        if (from.getDistance(to) <= 1e-4) continue;
        undirectedEdges.push({
          from: from,
          to: to,
          tag: baseSegments[s].tag || 'line'
        });
      }
    }

    var vertices = [];
    var vertexLookup = Object.create(null);
    function ensureVertex(point) {
      var key = vertexKey(point);
      var existing = vertexLookup[key];
      if (isFinite(existing)) return existing;
      var index = vertices.length;
      vertices.push(point);
      vertexLookup[key] = index;
      return index;
    }

    var directedEdges = [];
    var outgoingByVertex = [];
    for (var v = 0; v < undirectedEdges.length; v++) {
      var fromIndex = ensureVertex(undirectedEdges[v].from);
      var toIndex = ensureVertex(undirectedEdges[v].to);
      if (fromIndex === toIndex) continue;

      var forwardIndex = directedEdges.length;
      var backwardIndex = forwardIndex + 1;

      directedEdges.push({
        from: fromIndex,
        to: toIndex,
        twin: backwardIndex,
        next: -1,
        used: false,
        tag: undirectedEdges[v].tag,
        angle: Math.atan2(vertices[toIndex].y - vertices[fromIndex].y, vertices[toIndex].x - vertices[fromIndex].x)
      });
      directedEdges.push({
        from: toIndex,
        to: fromIndex,
        twin: forwardIndex,
        next: -1,
        used: false,
        tag: undirectedEdges[v].tag,
        angle: Math.atan2(vertices[fromIndex].y - vertices[toIndex].y, vertices[fromIndex].x - vertices[toIndex].x)
      });

      if (!outgoingByVertex[fromIndex]) outgoingByVertex[fromIndex] = [];
      if (!outgoingByVertex[toIndex]) outgoingByVertex[toIndex] = [];
      outgoingByVertex[fromIndex].push(forwardIndex);
      outgoingByVertex[toIndex].push(backwardIndex);
    }

    for (var ov = 0; ov < outgoingByVertex.length; ov++) {
      var edgeIds = outgoingByVertex[ov];
      if (!edgeIds || edgeIds.length < 1) continue;
      edgeIds.sort(function(leftId, rightId) {
        return directedEdges[leftId].angle - directedEdges[rightId].angle;
      });
    }

    for (var e = 0; e < directedEdges.length; e++) {
      var edge = directedEdges[e];
      var outgoing = outgoingByVertex[edge.to];
      if (!outgoing || !outgoing.length) continue;
      var twinIndex = edge.twin;
      var twinPosition = outgoing.indexOf(twinIndex);
      if (twinPosition === -1) continue;
      var nextPosition = (twinPosition - 1 + outgoing.length) % outgoing.length;
      edge.next = outgoing[nextPosition];
    }

    var faces = [];
    var minFaceArea = radius * radius * 0.00003;
    for (var startEdge = 0; startEdge < directedEdges.length; startEdge++) {
      if (directedEdges[startEdge].used) continue;
      var loopVertices = [];
      var tagSet = Object.create(null);
      var tagCounts = Object.create(null);
      var cursor = startEdge;
      var guard = 0;

      while (cursor >= 0 && !directedEdges[cursor].used && guard < 12000) {
        var current = directedEdges[cursor];
        current.used = true;
        loopVertices.push(vertices[current.from]);
        tagSet[current.tag] = true;
        tagCounts[current.tag] = (tagCounts[current.tag] || 0) + 1;
        cursor = current.next;
        guard += 1;
        if (cursor === startEdge) break;
      }

      if (cursor !== startEdge || loopVertices.length < 3) {
        continue;
      }

      var area = polygonSignedArea(loopVertices);
      if (Math.abs(area) < minFaceArea) continue;

      faces.push({
        id: faces.length,
        vertices: loopVertices,
        area: area,
        areaAbs: Math.abs(area),
        centroid: polygonCentroid(loopVertices),
        hasCircleEdge: !!tagSet.circle,
        starEdgeCount: tagCounts.star || 0
      });
    }

    if (faces.length > 1) {
      var outerIndex = 0;
      for (var f = 1; f < faces.length; f++) {
        if (faces[f].areaAbs > faces[outerIndex].areaAbs) {
          outerIndex = f;
        }
      }
      faces.splice(outerIndex, 1);
    }

    return faces;
  }

  var stitchedSegments = [];
  stitchedSegments = stitchedSegments.concat(buildTaggedSegmentsFromSequence(scaffoldPoints, firstPolygonSequence, 'thread1'));
  stitchedSegments = stitchedSegments.concat(buildTaggedSegmentsFromSequence(scaffoldPoints, offsetPolygonSequence, 'thread2'));
  stitchedSegments = stitchedSegments.concat(starThreadSegments);

  var extractedFaces = extractFacesFromSegments(stitchedSegments);
  var starPathVertices = buildStarInnerVertices(scaffoldPoints, starSequence);
  var petals = [];
  var pointRegions = [];
  var faceDiagnostics = {
    summary: {
      fold: safeFold,
      geometryMode: safeGeometryMode,
      extractedFaceCount: extractedFaces ? extractedFaces.length : 0
    },
    faces: []
  };

  function normalizeAnglePositive(theta) {
    var twoPi = Math.PI * 2;
    var value = theta % twoPi;
    if (value < 0) value += twoPi;
    return value;
  }

  function angleDistance(a, b) {
    var diff = Math.abs(normalizeAnglePositive(a) - normalizeAnglePositive(b));
    return Math.min(diff, Math.PI * 2 - diff);
  }

  function pointToSegmentDistance(point, segA, segB) {
    var segment = segB.subtract(segA);
    var denom = segment.dot(segment);
    if (denom <= 1e-10) return point.getDistance(segA);
    var t = point.subtract(segA).dot(segment) / denom;
    var clamped = Math.max(0, Math.min(1, t));
    var projection = segA.add(segment.multiply(clamped));
    return point.getDistance(projection);
  }

  function pointOnPolygonBoundary(point, polygon) {
    if (!polygon || polygon.length < 2) return false;
    var tolerance = Math.max(0.55, radius * 0.0024);
    for (var i = 0; i < polygon.length; i++) {
      var a = polygon[i];
      var b = polygon[(i + 1) % polygon.length];
      if (pointToSegmentDistance(point, a, b) <= tolerance) return true;
    }
    return false;
  }

  function getFaceBinByAngle(faceAngle) {
    var normalized = normalizeAnglePositive(faceAngle + (angleStep / 2));
    return Math.floor(normalized / angleStep) % safeFold;
  }

  function getFaceBin(face) {
    var c = face.centroid;
    var a = Math.atan2(c.y - center.y, c.x - center.x);
    return getFaceBinByAngle(a);
  }

  function selectOnePerBin(faceList, preferOuter) {
    var selectedByBin = new Array(safeFold);
    var metricByBin = new Array(safeFold);
    for (var i = 0; i < faceList.length; i++) {
      var face = faceList[i];
      var bin = getFaceBin(face);
      var metric = face.centroid.getDistance(center);
      if (!selectedByBin[bin]) {
        selectedByBin[bin] = face;
        metricByBin[bin] = metric;
        continue;
      }
      var better = preferOuter ? (metric > metricByBin[bin]) : (metric < metricByBin[bin]);
      if (better) {
        selectedByBin[bin] = face;
        metricByBin[bin] = metric;
      }
    }
    var selected = [];
    for (var b = 0; b < selectedByBin.length; b++) {
      if (selectedByBin[b]) selected.push(selectedByBin[b]);
    }
    selected.sort(function(left, right) {
      return getFaceBin(left) - getFaceBin(right);
    });
    return selected;
  }

  var thread1Cycle = buildMashrabiyaStepSequence(scaffoldCount, 0, 16);
  var thread2Cycle = buildMashrabiyaStepSequence(scaffoldCount, 8, 16);
  var scaffoldVertexIndices = [];
  var seenScaffoldIndex = Object.create(null);
  function pushUniqueScaffoldIndex(index) {
    var key = String(index);
    if (seenScaffoldIndex[key]) return;
    seenScaffoldIndex[key] = true;
    scaffoldVertexIndices.push(index);
  }
  for (var t1 = 0; t1 < thread1Cycle.length; t1++) pushUniqueScaffoldIndex(thread1Cycle[t1]);
  for (var t2 = 0; t2 < thread2Cycle.length; t2++) pushUniqueScaffoldIndex(thread2Cycle[t2]);

  function faceContainsScaffoldVertex(face) {
    for (var i = 0; i < scaffoldVertexIndices.length; i++) {
      var vertexPoint = scaffoldPoints[scaffoldVertexIndices[i]];
      if (pointOnPolygonBoundary(vertexPoint, face.vertices)) {
        return true;
      }
    }
    return false;
  }

  var starThreadVertices = [];
  var seenStarThreadVertex = Object.create(null);
  for (var st = 0; st < starThreadSegments.length; st++) {
    var stFrom = starThreadSegments[st] && starThreadSegments[st].from;
    var stTo = starThreadSegments[st] && starThreadSegments[st].to;
    if (stFrom) {
      var stFromKey = vertexKey(stFrom);
      if (!seenStarThreadVertex[stFromKey]) {
        seenStarThreadVertex[stFromKey] = true;
        starThreadVertices.push(stFrom);
      }
    }
    if (stTo) {
      var stToKey = vertexKey(stTo);
      if (!seenStarThreadVertex[stToKey]) {
        seenStarThreadVertex[stToKey] = true;
        starThreadVertices.push(stTo);
      }
    }
  }

  function faceContainsStarThreadVertex(face) {
    for (var i = 0; i < starThreadVertices.length; i++) {
      if (pointOnPolygonBoundary(starThreadVertices[i], face.vertices)) {
        return true;
      }
    }
    return false;
  }

  function edgeKeyForPoints(a, b) {
    var aKey = vertexKey(a);
    var bKey = vertexKey(b);
    return aKey < bKey ? (aKey + '::' + bKey) : (bKey + '::' + aKey);
  }

  function buildFaceAdjacencyBySharedEdge(faces) {
    var edgeOwners = Object.create(null);
    var adjacency = Object.create(null);
    for (var i = 0; i < faces.length; i++) {
      adjacency[String(faces[i].id)] = Object.create(null);
      for (var e = 0; e < faces[i].vertices.length; e++) {
        var a = faces[i].vertices[e];
        var b = faces[i].vertices[(e + 1) % faces[i].vertices.length];
        var key = edgeKeyForPoints(a, b);
        if (!edgeOwners[key]) edgeOwners[key] = [];
        edgeOwners[key].push(faces[i].id);
      }
    }

    var keys = Object.keys(edgeOwners);
    for (var k = 0; k < keys.length; k++) {
      var owners = edgeOwners[keys[k]];
      for (var aIdx = 0; aIdx < owners.length; aIdx++) {
        for (var bIdx = aIdx + 1; bIdx < owners.length; bIdx++) {
          adjacency[String(owners[aIdx])][String(owners[bIdx])] = true;
          adjacency[String(owners[bIdx])][String(owners[aIdx])] = true;
        }
      }
    }
    return adjacency;
  }

  function buildPathFromVertices(vertices) {
    if (!vertices || vertices.length < 3) return null;
    var path = new Path();
    for (var i = 0; i < vertices.length; i++) {
      path.add(vertices[i]);
    }
    path.closed = true;
    return path;
  }

  function mergeFacesToPolygon(faceList) {
    if (!faceList || !faceList.length) return [];
    if (faceList.length === 1) return faceList[0].vertices.slice();

    var merged = null;
    for (var i = 0; i < faceList.length; i++) {
      var facePath = buildPathFromVertices(faceList[i].vertices);
      if (!facePath) continue;

      if (!merged) {
        merged = facePath;
        continue;
      }

      var united = merged.unite(facePath);
      merged.remove();
      facePath.remove();
      merged = united;
    }

    if (!merged) return faceList[0].vertices.slice();

    var points = [];
    var bestSegments = null;
    if (merged.children && merged.children.length) {
      var bestArea = -1;
      for (var c = 0; c < merged.children.length; c++) {
        var child = merged.children[c];
        var childArea = Math.abs(child.area || 0);
        if (childArea > bestArea) {
          bestArea = childArea;
          bestSegments = child.segments;
        }
      }
    } else {
      bestSegments = merged.segments;
    }

    if (bestSegments && bestSegments.length >= 3) {
      for (var s = 0; s < bestSegments.length; s++) {
        points.push(bestSegments[s].point.clone());
      }
    }

    merged.remove();
    return points.length >= 3 ? points : faceList[0].vertices.slice();
  }

  function buildConnectedComponentsByBin(candidates, adjacency) {
    var byBin = new Array(safeFold);
    for (var i = 0; i < candidates.length; i++) {
      var info = candidates[i];
      var bin = getFaceBinByAngle(info.angle);
      if (!byBin[bin]) byBin[bin] = [];
      byBin[bin].push(info);
    }

    var componentsByBin = new Array(safeFold);
    for (var b = 0; b < safeFold; b++) {
      var bucket = byBin[b] || [];
      if (!bucket.length) {
        componentsByBin[b] = [];
        continue;
      }

      var bucketById = Object.create(null);
      for (var bi = 0; bi < bucket.length; bi++) {
        bucketById[String(bucket[bi].face.id)] = bucket[bi];
      }

      var visited = Object.create(null);
      var components = [];
      for (var k = 0; k < bucket.length; k++) {
        var seedId = String(bucket[k].face.id);
        if (visited[seedId]) continue;

        var queue = [seedId];
        visited[seedId] = true;
        var infos = [];

        while (queue.length) {
          var currentId = queue.shift();
          var currentInfo = bucketById[currentId];
          if (!currentInfo) continue;
          infos.push(currentInfo);

          var neighbors = adjacency[currentId] || {};
          var neighborIds = Object.keys(neighbors);
          for (var ni = 0; ni < neighborIds.length; ni++) {
            var nextId = neighborIds[ni];
            if (visited[nextId]) continue;
            if (!bucketById[nextId]) continue;
            visited[nextId] = true;
            queue.push(nextId);
          }
        }

        if (!infos.length) continue;

        var radiusSum = 0;
        var angleSumX = 0;
        var angleSumY = 0;
        var faces = [];
        for (var ci = 0; ci < infos.length; ci++) {
          radiusSum += infos[ci].radius;
          angleSumX += Math.cos(infos[ci].angle);
          angleSumY += Math.sin(infos[ci].angle);
          faces.push(infos[ci].face);
        }

        components.push({
          bin: b,
          infos: infos,
          faces: faces,
          faceIds: infos.map(function(info) { return info.face.id; }),
          radius: radiusSum / infos.length,
          angle: Math.atan2(angleSumY, angleSumX)
        });
      }

      componentsByBin[b] = components;
    }

    return componentsByBin;
  }

  function computeComponentStats(component) {
    var infos = component && component.infos ? component.infos : [];
    if (!infos.length) {
      component.radius = 0;
      component.angle = 0;
      component.faceIds = [];
      return;
    }
    var radiusSum = 0;
    var angleX = 0;
    var angleY = 0;
    var ids = [];
    for (var i = 0; i < infos.length; i++) {
      radiusSum += infos[i].radius;
      angleX += Math.cos(infos[i].angle);
      angleY += Math.sin(infos[i].angle);
      ids.push(infos[i].face.id);
    }
    component.radius = radiusSum / infos.length;
    component.angle = Math.atan2(angleY, angleX);
    component.faceIds = ids;
    component.faces = infos.map(function(info) { return info.face; });
  }

  function expandComponent(component, adjacency, infoById, options) {
    if (!component || !component.infos || !component.infos.length) return;
    options = options || {};
    var steps = Math.max(0, options.steps || 0);
    if (!steps) return;
    var maxAngleDrift = isFinite(options.maxAngleDrift) ? options.maxAngleDrift : (angleStep * 0.85);
    var baseAngle = component.angle;
    var seen = Object.create(null);
    for (var i = 0; i < component.infos.length; i++) {
      seen[String(component.infos[i].face.id)] = true;
    }

    for (var step = 0; step < steps; step++) {
      computeComponentStats(component);
      var currentRadius = component.radius;
      var toAdd = [];
      for (var ci = 0; ci < component.infos.length; ci++) {
        var faceId = String(component.infos[ci].face.id);
        var neighbors = adjacency[faceId] || {};
        var neighborIds = Object.keys(neighbors);
        for (var ni = 0; ni < neighborIds.length; ni++) {
          var neighborId = neighborIds[ni];
          if (seen[neighborId]) continue;
          var info = infoById[neighborId];
          if (!info) continue;
          if (angleDistance(info.angle, baseAngle) > maxAngleDrift) continue;
          if (options.filter && !options.filter(info, currentRadius, component)) continue;
          seen[neighborId] = true;
          toAdd.push(info);
        }
      }
      if (!toAdd.length) break;
      Array.prototype.push.apply(component.infos, toAdd);
    }
    computeComponentStats(component);
  }

  var starRegions = [];
  var debugRegions = [];

  if (extractedFaces && extractedFaces.length) {
    var starRadiusMean = 0;
    for (var sv = 0; sv < starPathVertices.length; sv++) {
      starRadiusMean += starPathVertices[sv].getDistance(center);
    }
    starRadiusMean = starPathVertices.length ? (starRadiusMean / starPathVertices.length) : (petalRadius * 0.33);

    var faceInfo = [];
    for (var fi = 0; fi < extractedFaces.length; fi++) {
      var face = extractedFaces[fi];
      var centroid = face.centroid;
      var radiusFromCenter = centroid.getDistance(center);
      var angle = Math.atan2(centroid.y - center.y, centroid.x - center.x);
      var hasScaffold = faceContainsScaffoldVertex(face);
      var hasStarThread = faceContainsStarThreadVertex(face);
      faceInfo.push({
        face: face,
        radius: radiusFromCenter,
        angle: angle,
        hasScaffold: hasScaffold,
        hasStarThread: hasStarThread
      });
    }

    faceInfo.sort(function(left, right) {
      return left.radius - right.radius;
    });

    var adjacency = buildFaceAdjacencyBySharedEdge(extractedFaces);
    var infoById = Object.create(null);
    for (var ii = 0; ii < faceInfo.length; ii++) {
      infoById[String(faceInfo[ii].face.id)] = faceInfo[ii];
    }

    var selectedPetalFaceIds = Object.create(null);
    var selectedPointFaceIds = Object.create(null);

    function getMashrabiyaFaceProfilesForFold(fold) {
      if (fold === 12) {
        return {
          petal: [
            {
              vertexCount: 5,
              requiresScaffold: true,
              requiresStarThread: false,
              radiusRange: [0.88, 0.95],
              areaRange: [0.02, 0.032],
              pickMode: 'per-bin-best',
              targetRadiusNorm: 0.91674143,
              targetAreaNorm: 0.02500639
            },
            {
              vertexCount: 5,
              requiresScaffold: false,
              requiresStarThread: true,
              radiusRange: [0.57, 0.66],
              areaRange: [0.1, 0.15],
              pickMode: 'per-bin-best',
              targetRadiusNorm: 0.61423034,
              targetAreaNorm: 0.12815022
            }
          ],
          point: [
            {
              vertexCount: 4,
              requiresScaffold: false,
              requiresStarThread: true,
              radiusRange: [0.27, 0.36],
              areaRange: [0.015, 0.03],
              pickMode: 'all',
              targetRadiusNorm: 0.31100423,
              targetAreaNorm: 0.02123412
            }
          ]
        };
      }

      if (fold === 8) {
        return {
          petal: [
            {
              vertexCount: 5,
              requiresScaffold: true,
              requiresStarThread: false,
              radiusRange: [0.78, 0.85],
              areaRange: [0.06, 0.09],
              pickMode: 'per-bin-best',
              targetRadiusNorm: 0.81345281,
              targetAreaNorm: 0.07547373
            },
            {
              vertexCount: 5,
              requiresScaffold: false,
              requiresStarThread: true,
              radiusRange: [0.5, 0.56],
              areaRange: [0.11, 0.14],
              pickMode: 'per-bin-best',
              targetRadiusNorm: 0.53221215,
              targetAreaNorm: 0.13043301
            }
          ],
          point: [
            {
              vertexCount: 4,
              requiresScaffold: false,
              requiresStarThread: true,
              radiusRange: [0.3, 0.34],
              areaRange: [0.028, 0.033],
              pickMode: 'all',
              targetRadiusNorm: 0.31903559,
              targetAreaNorm: 0.03033009
            }
          ]
        };
      }

      return {
        petal: [],
        point: []
      };
    }

    function matchFaceProfile(info, profile, outerRadiusValue) {
      if (!info || !profile || !info.face || !info.face.vertices) return false;
      if (!isFinite(outerRadiusValue) || outerRadiusValue <= 1e-6) return false;

      if (isFinite(profile.vertexCount) && info.face.vertices.length !== profile.vertexCount) return false;
      if (typeof profile.requiresScaffold === 'boolean' && !!info.hasScaffold !== profile.requiresScaffold) return false;
      if (typeof profile.requiresStarThread === 'boolean' && !!info.hasStarThread !== profile.requiresStarThread) return false;

      var radiusNorm = info.radius / outerRadiusValue;
      var areaNorm = Math.abs(info.face.areaAbs || 0) / (outerRadiusValue * outerRadiusValue);
      if (!isFinite(radiusNorm) || !isFinite(areaNorm)) return false;

      if (profile.radiusRange && profile.radiusRange.length === 2) {
        if (radiusNorm < profile.radiusRange[0] || radiusNorm > profile.radiusRange[1]) return false;
      }
      if (profile.areaRange && profile.areaRange.length === 2) {
        if (areaNorm < profile.areaRange[0] || areaNorm > profile.areaRange[1]) return false;
      }

      return true;
    }

    function pickFacesByProfile(faceList, profile, outerRadiusValue) {
      var matches = faceList.filter(function(info) {
        return matchFaceProfile(info, profile, outerRadiusValue);
      });
      if (!matches.length) return [];

      if (profile.pickMode !== 'per-bin-best') {
        return matches;
      }

      var bestByBin = new Array(safeFold);
      var scoreByBin = new Array(safeFold);
      var targetRadius = isFinite(profile.targetRadiusNorm) ? profile.targetRadiusNorm : 0;
      var targetArea = isFinite(profile.targetAreaNorm) ? profile.targetAreaNorm : 0;

      for (var i = 0; i < matches.length; i++) {
        var info = matches[i];
        var bin = getFaceBin(info.face);
        if (bin < 0 || bin >= safeFold) continue;
        var radiusNorm = info.radius / outerRadiusValue;
        var areaNorm = Math.abs(info.face.areaAbs || 0) / (outerRadiusValue * outerRadiusValue);
        var score = Math.abs(radiusNorm - targetRadius) + (0.55 * Math.abs(areaNorm - targetArea));
        if (!bestByBin[bin] || score < scoreByBin[bin]) {
          bestByBin[bin] = info;
          scoreByBin[bin] = score;
        }
      }

      var chosen = [];
      for (var b = 0; b < bestByBin.length; b++) {
        if (bestByBin[b]) chosen.push(bestByBin[b]);
      }
      return chosen;
    }

    function markFacesFromProfiles(faceList, profiles, outerRadiusValue) {
      var result = Object.create(null);
      var profileList = Array.isArray(profiles) ? profiles : [];
      for (var p = 0; p < profileList.length; p++) {
        var picked = pickFacesByProfile(faceList, profileList[p], outerRadiusValue);
        for (var i = 0; i < picked.length; i++) {
          result[String(picked[i].face.id)] = true;
        }
      }
      return result;
    }

    var faceProfiles = getMashrabiyaFaceProfilesForFold(safeFold);
    var forcedPetalFaceIds = markFacesFromProfiles(faceInfo, faceProfiles.petal, petalRadius);
    var forcedPetalFaceIdList = Object.keys(forcedPetalFaceIds);
    for (var fp = 0; fp < forcedPetalFaceIdList.length; fp++) {
      selectedPetalFaceIds[forcedPetalFaceIdList[fp]] = true;
    }

    var forcedPointFaceIds = markFacesFromProfiles(faceInfo, faceProfiles.point, petalRadius);
    var forcedPointFaceIdList = Object.keys(forcedPointFaceIds);
    for (var fpt = 0; fpt < forcedPointFaceIdList.length; fpt++) {
      selectedPointFaceIds[forcedPointFaceIdList[fpt]] = true;
    }

    // 1) pickStarFaces: connected inner components (can merge multiple atomic faces).
    var starCandidates = faceInfo.filter(function(info) {
      if (forcedPetalFaceIds[String(info.face.id)]) return false;
      if (forcedPointFaceIds[String(info.face.id)]) return false;
      return !info.hasScaffold && (info.hasStarThread || info.radius <= (starRadiusMean * 1.35));
    });
    if (!starCandidates.length) {
      starCandidates = faceInfo.filter(function(info) {
        if (forcedPetalFaceIds[String(info.face.id)]) return false;
        if (forcedPointFaceIds[String(info.face.id)]) return false;
        return !info.hasScaffold;
      });
    }

    var starComponentsByBin = buildConnectedComponentsByBin(starCandidates, adjacency);
    var selectedStarComponents = [];
    var usedStarFaceIds = Object.create(null);
    var selectedStarFaceIds = Object.create(null);

    for (var sb = 0; sb < safeFold; sb++) {
      var starBucket = starComponentsByBin[sb] || [];
      if (!starBucket.length) continue;
      starBucket.sort(function(left, right) {
        return left.radius - right.radius;
      });
      var chosenStar = starBucket[0];
      expandComponent(chosenStar, adjacency, infoById, {
        steps: 2,
        maxAngleDrift: angleStep * 0.72,
        filter: function(info, currentRadius) {
          if (forcedPetalFaceIds[String(info.face.id)]) return false;
          if (forcedPointFaceIds[String(info.face.id)]) return false;
          return !info.hasScaffold && info.radius >= (currentRadius * 0.9);
        }
      });
      selectedStarComponents.push(chosenStar);
      for (var sfi = 0; sfi < chosenStar.faces.length; sfi++) {
        usedStarFaceIds[String(chosenStar.faces[sfi].id)] = true;
        selectedStarFaceIds[String(chosenStar.faces[sfi].id)] = true;
      }
      var mergedStar = mergeFacesToPolygon(chosenStar.faces);
      if (mergedStar.length >= 3) {
        starRegions.push(mergedStar);
        debugRegions.push({
          label: 'S ' + sb + ' (' + chosenStar.faces.length + ')',
          centroid: polygonCentroid(mergedStar),
          color: '#9c6f1d'
        });
      }
    }

    if (selectedStarComponents.length) {
      var starCenters = [];
      for (var sc = 0; sc < selectedStarComponents.length; sc++) {
        var regionCentroid = polygonCentroid(mergeFacesToPolygon(selectedStarComponents[sc].faces));
        starCenters.push(regionCentroid);
      }
      starCenters.sort(function(left, right) {
        var leftAngle = Math.atan2(left.y - center.y, left.x - center.x);
        var rightAngle = Math.atan2(right.y - center.y, right.x - center.x);
        return leftAngle - rightAngle;
      });
      starPathVertices = starCenters.slice(0, safeFold);
      starRadiusMean = 0;
      for (var ss = 0; ss < starPathVertices.length; ss++) {
        starRadiusMean += starPathVertices[ss].getDistance(center);
      }
      starRadiusMean = starRadiusMean / Math.max(1, starPathVertices.length);
    }

    var useForcedPetalProfiles = forcedPetalFaceIdList.length > 0;

    // 2) pickPetalFaces: connected outer scaffold components, one per sector.
    if (!useForcedPetalProfiles) {
      var petalInfoCandidates = faceInfo.filter(function(info) {
        if (forcedPetalFaceIds[String(info.face.id)]) return false;
        return info.hasScaffold && (info.hasStarThread || info.radius > (starRadiusMean * 1.3));
      });
      if (!petalInfoCandidates.length) {
        petalInfoCandidates = faceInfo.filter(function(info) {
          if (forcedPetalFaceIds[String(info.face.id)]) return false;
          return info.hasScaffold;
        });
      }

      var petalComponentsByBin = buildConnectedComponentsByBin(petalInfoCandidates, adjacency);

      for (var pb = 0; pb < safeFold; pb++) {
        var petalBucket = petalComponentsByBin[pb] || [];
        if (!petalBucket.length) continue;
        petalBucket.sort(function(left, right) {
          return right.radius - left.radius;
        });
        var chosenPetal = petalBucket[0];
        expandComponent(chosenPetal, adjacency, infoById, {
          steps: 2,
          maxAngleDrift: angleStep * 0.78,
          filter: function(info, currentRadius) {
            return info.radius <= currentRadius && info.radius >= (starRadiusMean * 1.08);
          }
        });
        for (var pfi = 0; pfi < chosenPetal.faces.length; pfi++) {
          selectedPetalFaceIds[String(chosenPetal.faces[pfi].id)] = true;
        }
        var mergedPetal = mergeFacesToPolygon(chosenPetal.faces);
        if (mergedPetal.length >= 3) {
          petals.push(mergedPetal);
          debugRegions.push({
            label: 'P ' + pb + ' (' + chosenPetal.faces.length + ')',
            centroid: polygonCentroid(mergedPetal),
            color: '#a9491e'
          });
        }
      }
    }

    if (useForcedPetalProfiles) {
      for (var fi2 = 0; fi2 < faceInfo.length; fi2++) {
        var forcedInfo = faceInfo[fi2];
        var forcedId = String(forcedInfo.face.id);
        if (!forcedPetalFaceIds[forcedId]) continue;
        var forcedBin = getFaceBin(forcedInfo.face);
        petals.push(forcedInfo.face.vertices.slice());
        debugRegions.push({
          label: 'P ' + forcedBin + ' (1)',
          centroid: polygonCentroid(forcedInfo.face.vertices),
          color: '#a9491e'
        });
      }
    }

    var useForcedPointProfiles = forcedPointFaceIdList.length > 0;
    if (useForcedPointProfiles) {
      for (var fi3 = 0; fi3 < faceInfo.length; fi3++) {
        var forcedPointInfo = faceInfo[fi3];
        var forcedPointId = String(forcedPointInfo.face.id);
        if (!forcedPointFaceIds[forcedPointId]) continue;
        var forcedPointBin = getFaceBin(forcedPointInfo.face);
        pointRegions.push(forcedPointInfo.face.vertices.slice());
        debugRegions.push({
          label: 'T ' + forcedPointBin + ' (1)',
          centroid: polygonCentroid(forcedPointInfo.face.vertices),
          color: '#a73631'
        });
      }
    }

    // 3) pickTriangleFaces: connected components adjacent to star components, up to two per sector.
    if (!useForcedPointProfiles) {
      var starFaceIdLookup = Object.create(null);
      var starFaceIdList = Object.keys(usedStarFaceIds);
      for (var sId = 0; sId < starFaceIdList.length; sId++) {
        starFaceIdLookup[starFaceIdList[sId]] = true;
      }

      var triangleCandidates = [];
      for (var ti = 0; ti < faceInfo.length; ti++) {
        var info = faceInfo[ti];
        var infoId = String(info.face.id);
        if (selectedPetalFaceIds[infoId]) continue;
        if (starFaceIdLookup[infoId]) continue;
        if (info.hasScaffold) continue;
        if (info.radius <= (starRadiusMean * 0.95)) continue;

        var neighbors = adjacency[infoId] || {};
        var neighborIds = Object.keys(neighbors);
        var touchesStar = false;
        for (var ni = 0; ni < neighborIds.length; ni++) {
          if (starFaceIdLookup[neighborIds[ni]]) {
            touchesStar = true;
            break;
          }
        }
        if (!touchesStar) continue;
        triangleCandidates.push(info);
      }

      var triangleComponentsByBin = buildConnectedComponentsByBin(triangleCandidates, adjacency);
      for (var tb = 0; tb < safeFold; tb++) {
        var triBucket = triangleComponentsByBin[tb] || [];
        if (!triBucket.length) continue;
        var centerAngle = -Math.PI / 2 + tb * angleStep;
        triBucket.sort(function(left, right) {
          var leftKey = angleDistance(left.angle, centerAngle) * 10 + left.radius;
          var rightKey = angleDistance(right.angle, centerAngle) * 10 + right.radius;
          return leftKey - rightKey;
        });

        for (var tk = 0; tk < triBucket.length && tk < 2; tk++) {
          expandComponent(triBucket[tk], adjacency, infoById, {
            steps: 1,
            maxAngleDrift: angleStep * 0.65,
            filter: function(info) {
              return !info.hasScaffold;
            }
          });
          for (var tif = 0; tif < triBucket[tk].faces.length; tif++) {
            var triFace = triBucket[tk].faces[tif];
            if (!triFace || !triFace.vertices || triFace.vertices.length < 3) continue;
            var triFaceId = String(triFace.id);
            if (selectedPointFaceIds[triFaceId]) continue;
            selectedPointFaceIds[triFaceId] = true;
            pointRegions.push(triFace.vertices.slice());
            debugRegions.push({
              label: 'T ' + tb + ' (1)',
              centroid: polygonCentroid(triFace.vertices),
              color: '#a73631'
            });
          }
        }
      }
    }

    // Fold-8 specific stabilization: build star/point fill regions directly
    // from selected face IDs so fill edges always match extracted face boundaries.
    if (safeFold === 8) {
      starRegions = [];
      pointRegions = [];
      for (var fs = 0; fs < faceInfo.length; fs++) {
        var selectedInfo = faceInfo[fs];
        var selectedFace = selectedInfo.face;
        if (!selectedFace || !selectedFace.vertices || selectedFace.vertices.length < 3) continue;
        var selectedId = String(selectedFace.id);

        if (selectedStarFaceIds[selectedId]) {
          starRegions.push(selectedFace.vertices.slice());
          continue;
        }

        if (selectedPointFaceIds[selectedId]) {
          pointRegions.push(selectedFace.vertices.slice());
        }
      }
    }

    // Keep point fills strictly aligned with selected point face IDs.
    // This avoids union/merge artifacts causing correct labels but missing fills.
    var selectedPointFaceIdListForFill = Object.keys(selectedPointFaceIds);
    if (selectedPointFaceIdListForFill.length) {
      pointRegions = [];

      for (var pf = 0; pf < faceInfo.length; pf++) {
        var pointInfo = faceInfo[pf];
        var pointFaceId = String(pointInfo.face.id);
        if (!selectedPointFaceIds[pointFaceId]) continue;
        if (!pointInfo.face.vertices || pointInfo.face.vertices.length < 3) continue;
        pointRegions.push(pointInfo.face.vertices.slice());
      }
    }

    for (var fd = 0; fd < faceInfo.length; fd++) {
      var info = faceInfo[fd];
      var face = info.face;
      var faceId = String(face.id);
      var classification = 'other';
      if (selectedPetalFaceIds[faceId]) {
        classification = 'petal';
      } else if (selectedPointFaceIds[faceId]) {
        classification = 'point';
      } else if (selectedStarFaceIds[faceId]) {
        classification = 'star';
      }
      faceDiagnostics.faces.push({
        id: face.id,
        bin: getFaceBin(face),
        classification: classification,
        radius: info.radius,
        angle: info.angle,
        hasScaffold: !!info.hasScaffold,
        hasStarThread: !!info.hasStarThread,
        hasCircleEdge: !!face.hasCircleEdge,
        starEdgeCount: parseBoundedInt(face.starEdgeCount, 0, 9999, 0),
        areaAbs: Math.abs(face.areaAbs || 0),
        centroid: {
          x: face.centroid.x,
          y: face.centroid.y
        },
        vertexCount: (face.vertices && face.vertices.length) ? face.vertices.length : 0
      });
    }

    faceDiagnostics.summary.selectedStarFaceCount = Object.keys(selectedStarFaceIds).length;
    faceDiagnostics.summary.selectedPetalFaceCount = Object.keys(selectedPetalFaceIds).length;
    faceDiagnostics.summary.selectedPointFaceCount = Object.keys(selectedPointFaceIds).length;
  }

  if (!starPathVertices || starPathVertices.length < safeFold) {
    // Fallback star geometry if extraction is underconstrained.
    starPathVertices = [];
    for (var fallbackIndex = 0; fallbackIndex < safeFold; fallbackIndex++) {
      var fallbackAngle = -Math.PI / 2 + fallbackIndex * angleStep;
      starPathVertices.push(pointAt(fallbackAngle, radius * 0.33));
    }
  }

  if (!petals.length || (!pointRegions.length && safeFold !== 8)) {
    var legacy = buildLegacyFillGeometry(starPathVertices);
    if (!petals.length) petals = legacy.petals;
    if (!pointRegions.length && safeFold !== 8) pointRegions = legacy.pointRegions;
  }

  return {
    fold: safeFold,
    center: center,
    outerRadius: petalRadius,
    guideCircleVertices: guideCircleVertices,
    holePoints: petalTips,
    geometryMode: safeGeometryMode,
    scaffoldPoints: scaffoldPoints,
    scaffoldCount: scaffoldCount,
    innerGuideCircleVertices: innerGuideCircleVertices,
    circleSequence: circleSequence,
    firstPolygonSequence: firstPolygonSequence,
    offsetPolygonSequence: offsetPolygonSequence,
    starSequence: starSequence,
    starThreadSegments: starThreadSegments,
    starJump: starJump,
    petals: petals,
    pointRegions: pointRegions,
    starPathVertices: starPathVertices,
    starRegions: starRegions,
    debugRegions: debugRegions,
    faceDiagnostics: faceDiagnostics
  };
}

function drawMashrabiyaRegionPolygon(vertices, fillColor, fillOpacity) {
  if (!vertices || vertices.length < 3) return;
  var shape = new Path();
  for (var i = 0; i < vertices.length; i++) {
    shape.add(vertices[i]);
  }
  shape.closed = true;
  shape.fillColor = fillColor;
  shape.opacity = Math.max(0, Math.min(1, fillOpacity));
}

function getMashrabiyaPointKey(point) {
  if (!point) return '';
  return formatSvgNumber(point.x) + ',' + formatSvgNumber(point.y);
}

function getMashrabiyaEdgeKey(a, b) {
  var aKey = getMashrabiyaPointKey(a);
  var bKey = getMashrabiyaPointKey(b);
  if (!aKey || !bKey) return '';
  return aKey < bKey ? (aKey + '|' + bKey) : (bKey + '|' + aKey);
}

function normalizeMashrabiyaPoint(point) {
  return {
    x: Math.round(point.x * 1000) / 1000,
    y: Math.round(point.y * 1000) / 1000
  };
}

function isMashrabiyaPointOnSegment(point, from, to) {
  var epsilon = 1e-6;
  var abx = to.x - from.x;
  var aby = to.y - from.y;
  var apx = point.x - from.x;
  var apy = point.y - from.y;
  var cross = (abx * apy) - (aby * apx);
  if (Math.abs(cross) > epsilon) return false;
  var dot = (apx * abx) + (apy * aby);
  if (dot < -epsilon) return false;
  var lenSq = (abx * abx) + (aby * aby);
  if (dot > lenSq + epsilon) return false;
  return true;
}

function splitMashrabiyaEdge(edgeStart, edgeEnd, allPoints) {
  var pieces = [];
  if (!edgeStart || !edgeEnd || !allPoints || !allPoints.length) return pieces;

  var pointsOnEdge = [];
  for (var i = 0; i < allPoints.length; i++) {
    var candidate = allPoints[i];
    if (isMashrabiyaPointOnSegment(candidate, edgeStart, edgeEnd)) {
      pointsOnEdge.push(candidate);
    }
  }
  if (pointsOnEdge.length < 2) return pieces;

  var dominantAxis = Math.abs(edgeEnd.x - edgeStart.x) >= Math.abs(edgeEnd.y - edgeStart.y) ? 'x' : 'y';
  pointsOnEdge.sort(function(a, b) {
    if (dominantAxis === 'x') {
      if (a.x !== b.x) return a.x - b.x;
      return a.y - b.y;
    }
    if (a.y !== b.y) return a.y - b.y;
    return a.x - b.x;
  });

  for (var j = 0; j < pointsOnEdge.length - 1; j++) {
    var from = pointsOnEdge[j];
    var to = pointsOnEdge[j + 1];
    if (Math.abs(from.x - to.x) < 1e-6 && Math.abs(from.y - to.y) < 1e-6) continue;
    pieces.push({ from: from, to: to });
  }
  return pieces;
}

function collectMashrabiyaBoundaryEdges(polygons) {
  var edgeCounts = Object.create(null);
  var edgeRefs = Object.create(null);
  var edges = [];
  if (!polygons || !polygons.length) return edges;

  var pointMap = Object.create(null);
  for (var i = 0; i < polygons.length; i++) {
    var polygon = polygons[i];
    if (!polygon || !polygon.length) continue;
    for (var v = 0; v < polygon.length; v++) {
      var normalizedVertex = normalizeMashrabiyaPoint(polygon[v]);
      var vertexKey = getMashrabiyaPointKey(normalizedVertex);
      if (!pointMap[vertexKey]) {
        pointMap[vertexKey] = normalizedVertex;
      }
    }
  }
  var allPoints = Object.keys(pointMap).map(function(key) {
    return pointMap[key];
  });

  for (var p = 0; p < polygons.length; p++) {
    var vertices = polygons[p];
    if (!vertices || vertices.length < 2) continue;
    for (var j = 0; j < vertices.length; j++) {
      var from = normalizeMashrabiyaPoint(vertices[j]);
      var to = normalizeMashrabiyaPoint(vertices[(j + 1) % vertices.length]);
      if (!from || !to) continue;
      var subEdges = splitMashrabiyaEdge(from, to, allPoints);
      for (var s = 0; s < subEdges.length; s++) {
        var subEdge = subEdges[s];
        var edgeKey = getMashrabiyaEdgeKey(subEdge.from, subEdge.to);
        if (!edgeKey) continue;
        edgeCounts[edgeKey] = (edgeCounts[edgeKey] || 0) + 1;
        if (!edgeRefs[edgeKey]) {
          edgeRefs[edgeKey] = {
            from: subEdge.from,
            to: subEdge.to
          };
        }
      }
    }
  }

  var keys = Object.keys(edgeCounts);
  for (var k = 0; k < keys.length; k++) {
    var key = keys[k];
    if (edgeCounts[key] === 1 && edgeRefs[key]) {
      edges.push(edgeRefs[key]);
    }
  }

  return edges;
}

function drawMashrabiyaFillBorderEdges(polygons, strokeColor, strokeWidth, opacity) {
  if (!polygons || !polygons.length) return;
  if (!isFinite(strokeWidth) || strokeWidth <= 0) return;
  var strokeOpacity = Math.max(0, Math.min(1, isFinite(opacity) ? opacity : 1));
  if (strokeOpacity <= 0) return;

  // Unite same-type polygons first so shared internal seams cannot be stroked.
  var unionItem = null;
  for (var i = 0; i < polygons.length; i++) {
    var vertices = polygons[i];
    if (!vertices || vertices.length < 3) continue;
    var polygonPath = new Path({
      segments: vertices,
      closed: true,
      insert: false
    });
    if (!unionItem) {
      unionItem = polygonPath;
      continue;
    }
    var merged = unionItem.unite(polygonPath, { insert: false });
    unionItem.remove();
    polygonPath.remove();
    unionItem = merged;
  }

  if (!unionItem) return;

  unionItem.fillColor = null;
  unionItem.strokeColor = strokeColor;
  unionItem.strokeWidth = strokeWidth;
  unionItem.strokeCap = 'round';
  unionItem.strokeJoin = 'round';
  unionItem.opacity = strokeOpacity;
  if (!unionItem.parent) {
    project.activeLayer.addChild(unionItem);
  }
}

function getMashrabiyaFillPhaseBeats(fold) {
  var baseBeats = Math.max(2, Math.round(fold * 0.5));
  return Math.max(2, Math.round(baseBeats * mashrabiyaFillPhaseBeatScale));
}

function buildMashrabiyaAnimationTimeline(geometry) {
  var fillPhaseBeats = getMashrabiyaFillPhaseBeats(geometry.fold);
  return {
    dCircle: geometry.fold,
    dOuter: geometry.firstPolygonSequence.length,
    dOffset: geometry.offsetPolygonSequence.length,
    dInner: (geometry.innerGuideCircleVertices && geometry.innerGuideCircleVertices.length) ? Math.max(2, Math.round(geometry.innerGuideCircleVertices.length / 6)) : 0,
    dStar: (geometry.starThreadSegments && geometry.starThreadSegments.length) ? geometry.starThreadSegments.length : geometry.starSequence.length,
    dFillStar: fillPhaseBeats,
    dFillPetal: fillPhaseBeats,
    dFillPoint: fillPhaseBeats
  };
}

function getMashrabiyaTimelineFallback(geometry) {
  if (!geometry) {
    return {
      dCircle: 12,
      dOuter: 12,
      dOffset: 12,
      dInner: 0,
      dStar: 12,
      dFillStar: getMashrabiyaFillPhaseBeats(12),
      dFillPetal: getMashrabiyaFillPhaseBeats(12),
      dFillPoint: getMashrabiyaFillPhaseBeats(12)
    };
  }
  return buildMashrabiyaAnimationTimeline(geometry);
}

function drawMashrabiyaFilledGeometry(geometry, starOpacity, petalOpacity, pointOpacity) {
  if (!geometry) return;
  var opacityScale = Math.max(0, Math.min(1, mashrabiyaDebugFillOpacityScale));
  var starFillOpacity = Math.max(0, Math.min(1, starOpacity)) * opacityScale;
  var petalFillOpacity = Math.max(0, Math.min(1, petalOpacity)) * opacityScale;
  var pointFillOpacity = Math.max(0, Math.min(1, pointOpacity)) * opacityScale;
  var fillBorderWidth = sanitizeMashrabiyaFillBorderWidth(mashrabiyaFillBorderWidth, 0);

  var starPolygons = (geometry.starRegions && geometry.starRegions.length)
    ? geometry.starRegions
    : [geometry.starPathVertices];

  // Paint order matters: point regions should sit above star/petal fills.
  // This avoids correctly classified point faces being visually overpainted.
  for (var s = 0; s < starPolygons.length; s++) {
    drawMashrabiyaRegionPolygon(starPolygons[s], mashrabiyaStarColor, starFillOpacity);
  }

  for (var i = 0; i < geometry.petals.length; i++) {
    drawMashrabiyaRegionPolygon(geometry.petals[i], mashrabiyaPetalColor, petalFillOpacity);
  }
  for (var j = 0; j < geometry.pointRegions.length; j++) {
    drawMashrabiyaRegionPolygon(geometry.pointRegions[j], mashrabiyaPointColor, pointFillOpacity);
  }

  if (fillBorderWidth > 0) {
    drawMashrabiyaFillBorderEdges(starPolygons, '#82511f', fillBorderWidth, starFillOpacity);
    drawMashrabiyaFillBorderEdges(geometry.petals, '#82511f', fillBorderWidth, petalFillOpacity);
    drawMashrabiyaFillBorderEdges(geometry.pointRegions, '#82511f', fillBorderWidth, pointFillOpacity);
  }
}

function drawMashrabiyaSelectionOutlines(polygons, strokeColor, progress) {
  if (!polygons || !polygons.length) return;
  var p = clamp01(progress);
  if (p <= 0) return;

  var visibleCount = Math.max(0, Math.min(polygons.length, Math.ceil(polygons.length * p)));
  var strokeWidth = 1.6 + (2.8 * p);
  var strokeOpacity = 0.22 + (0.6 * p);

  for (var i = 0; i < visibleCount; i++) {
    var vertices = polygons[i];
    if (!vertices || vertices.length < 3) continue;
    var outline = new Path();
    for (var v = 0; v < vertices.length; v++) {
      outline.add(vertices[v]);
    }
    outline.closed = true;
    outline.strokeColor = strokeColor;
    outline.strokeWidth = strokeWidth;
    outline.opacity = strokeOpacity;
  }
}

function drawMashrabiyaDebugLabels(debugRegions, opacity) {
  if (!mashrabiyaDebugLabelsEnabled || !debugRegions || !debugRegions.length) return;
  var alpha = Math.max(0, Math.min(1, isFinite(opacity) ? opacity : 1));
  if (alpha <= 0) return;

  for (var i = 0; i < debugRegions.length; i++) {
    var entry = debugRegions[i];
    if (!entry || !entry.centroid || !entry.label) continue;

    var badge = new Path.Rectangle({
      point: new Point(entry.centroid.x - 22, entry.centroid.y - 9),
      size: new Size(44, 18),
      radius: 4
    });
    badge.fillColor = '#fffaf0';
    badge.strokeColor = entry.color || '#6f4a1a';
    badge.strokeWidth = 0.8;
    badge.opacity = 0.75 * alpha;

    var text = new PointText({
      point: new Point(entry.centroid.x, entry.centroid.y + 3),
      content: entry.label,
      justification: 'center',
      fillColor: entry.color || '#6f4a1a',
      fontFamily: 'Arial',
      fontSize: 9,
      fontWeight: 'bold'
    });
    text.opacity = 0.9 * alpha;
  }
}

function drawMashrabiyaFaceDiagnostics(faceDiagnostics, opacity) {
  if (!mashrabiyaDebugLabelsEnabled || !faceDiagnostics || !faceDiagnostics.faces || !faceDiagnostics.faces.length) return;
  var alpha = Math.max(0, Math.min(1, isFinite(opacity) ? opacity : 1));
  if (alpha <= 0) return;

  for (var i = 0; i < faceDiagnostics.faces.length; i++) {
    var face = faceDiagnostics.faces[i];
    if (!face || !face.centroid) continue;

    var classColor = '#666666';
    var classToken = 'O';
    if (face.classification === 'star') {
      classColor = '#9c6f1d';
      classToken = 'S';
    } else if (face.classification === 'petal') {
      classColor = '#a9491e';
      classToken = 'P';
    } else if (face.classification === 'point') {
      classColor = '#a73631';
      classToken = 'T';
    }

    var text = new PointText({
      point: new Point(face.centroid.x, face.centroid.y + 3),
      content: 'F' + String(face.id) + ' ' + classToken + ' b' + String(face.bin),
      justification: 'center',
      fillColor: classColor,
      fontFamily: 'Arial',
      fontSize: 8,
      fontWeight: 'bold'
    });
    text.opacity = 0.86 * alpha;
  }
}

function drawMashrabiyaStitchedLines(geometry, opacity) {
  if (!geometry) return;
  var lineOpacity = Math.max(0, Math.min(1, opacity));
  if (lineOpacity <= 0) return;
  drawMashrabiyaClosedStrokeProgress(geometry.guideCircleVertices, '#82511f', 2, lineOpacity, 1);
  drawMashrabiyaSequenceProgress(geometry.scaffoldPoints || geometry.holePoints, geometry.firstPolygonSequence, '#82511f', 2, lineOpacity, 1);
  drawMashrabiyaSequenceProgress(geometry.scaffoldPoints || geometry.holePoints, geometry.offsetPolygonSequence, '#82511f', 2, lineOpacity, 1);
  drawMashrabiyaClosedStrokeProgress(geometry.innerGuideCircleVertices, '#82511f', 2, lineOpacity, 1);
  drawMashrabiyaSegmentListProgress(geometry.starThreadSegments, '#82511f', 2, lineOpacity, 1);
}

function drawMashrabiyaSequenceProgress(pointsList, sequence, color, strokeWidth, opacity, progress) {
  if (!pointsList || pointsList.length < 2 || !sequence || sequence.length < 2) return;
  var p = clamp01(progress);
  var strokeOpacity = Math.max(0, Math.min(1, opacity));
  if (p <= 0 || strokeOpacity <= 0) return;

  var lengths = [];
  var totalLength = 0;
  for (var i = 0; i < sequence.length; i++) {
    var startIndex = sequence[i];
    var endIndex = sequence[(i + 1) % sequence.length];
    var start = pointsList[startIndex];
    var end = pointsList[endIndex];
    if (!start || !end) continue;
    var edgeLength = start.getDistance(end);
    lengths.push(edgeLength);
    totalLength += edgeLength;
  }
  if (!isFinite(totalLength) || totalLength <= 1e-6) return;

  var targetLength = totalLength * p;
  var traversed = 0;
  var path = new Path();
  path.strokeColor = color;
  path.strokeWidth = strokeWidth;
  path.opacity = strokeOpacity;
  path.add(pointsList[sequence[0]]);

  for (var edgeIndex = 0; edgeIndex < sequence.length; edgeIndex++) {
    var edgeStart = pointsList[sequence[edgeIndex]];
    var edgeEnd = pointsList[sequence[(edgeIndex + 1) % sequence.length]];
    if (!edgeStart || !edgeEnd) continue;
    var edgeLen = edgeStart.getDistance(edgeEnd);
    var remaining = targetLength - traversed;

    if (remaining <= 0) {
      break;
    }

    if (remaining >= edgeLen) {
      path.add(edgeEnd);
      traversed += edgeLen;
    } else {
      var ratio = edgeLen > 0 ? (remaining / edgeLen) : 0;
      path.add(edgeStart.add(edgeEnd.subtract(edgeStart).multiply(ratio)));
      break;
    }
  }
}

function drawMashrabiyaSegmentListProgress(segments, color, strokeWidth, opacity, progress) {
  if (!segments || !segments.length) return;
  var p = clamp01(progress);
  var strokeOpacity = Math.max(0, Math.min(1, opacity));
  if (p <= 0 || strokeOpacity <= 0) return;

  var lengths = [];
  var totalLength = 0;
  for (var i = 0; i < segments.length; i++) {
    var segment = segments[i];
    if (!segment || !segment.from || !segment.to) {
      lengths.push(0);
      continue;
    }
    var length = segment.from.getDistance(segment.to);
    lengths.push(length);
    totalLength += length;
  }
  if (!isFinite(totalLength) || totalLength <= 1e-6) return;

  var targetLength = totalLength * p;
  var traversed = 0;

  for (var s = 0; s < segments.length; s++) {
    var edge = segments[s];
    var edgeLen = lengths[s];
    if (!edge || !edge.from || !edge.to || edgeLen <= 1e-6) continue;

    var remaining = targetLength - traversed;
    if (remaining <= 0) break;

    var path = new Path();
    path.strokeColor = color;
    path.strokeWidth = strokeWidth;
    path.opacity = strokeOpacity;
    path.add(edge.from);

    if (remaining >= edgeLen) {
      path.add(edge.to);
      traversed += edgeLen;
    } else {
      var ratio = remaining / edgeLen;
      path.add(edge.from.add(edge.to.subtract(edge.from).multiply(ratio)));
      break;
    }
  }
}

function drawMashrabiyaClosedStrokeProgress(vertices, color, strokeWidth, opacity, progress) {
  if (!vertices || vertices.length < 3) return;
  var p = clamp01(progress);
  var strokeOpacity = Math.max(0, Math.min(1, opacity));
  if (p <= 0 || strokeOpacity <= 0) return;

  var lengths = [];
  var totalLength = 0;
  for (var i = 0; i < vertices.length; i++) {
    var start = vertices[i];
    var end = vertices[(i + 1) % vertices.length];
    var edgeLength = start.getDistance(end);
    lengths.push(edgeLength);
    totalLength += edgeLength;
  }
  if (!isFinite(totalLength) || totalLength <= 1e-6) return;

  var targetLength = totalLength * p;
  var traversed = 0;
  var path = new Path();
  path.strokeColor = color;
  path.strokeWidth = strokeWidth;
  path.opacity = strokeOpacity;
  path.add(vertices[0]);

  for (var edgeIndex = 0; edgeIndex < vertices.length; edgeIndex++) {
    var edgeStart = vertices[edgeIndex];
    var edgeEnd = vertices[(edgeIndex + 1) % vertices.length];
    var edgeLen = lengths[edgeIndex];
    var remaining = targetLength - traversed;

    if (remaining <= 0) {
      break;
    }

    if (remaining >= edgeLen) {
      path.add(edgeEnd);
      traversed += edgeLen;
    } else {
      var ratio = edgeLen > 0 ? (remaining / edgeLen) : 0;
      path.add(edgeStart.add(edgeEnd.subtract(edgeStart).multiply(ratio)));
      break;
    }
  }
}

function mashrabiyaPhaseProgress(elapsed, phaseStart, phaseDuration) {
  return clamp01((elapsed - phaseStart) / phaseDuration);
}

function renderMashrabiyaAnimationStateFrame(state) {
  if (!state) {
    drawMashrabiyaStatic();
    return;
  }

  project.activeLayer.removeChildren();

  var timeline = state.timeline || getMashrabiyaTimelineFallback(state.geometry);

  var dCircle = timeline.dCircle;
  var dOuter = timeline.dOuter;
  var dOffset = timeline.dOffset;
  var dInner = timeline.dInner || 0;
  var dStar = timeline.dStar;
  var dFillStar = timeline.dFillStar;
  var dFillPetal = timeline.dFillPetal;
  var dFillPoint = timeline.dFillPoint;

  var t = state.elapsedBeats;
  var sCircle = 0;
  var sOuter = sCircle + dCircle;
  var sOffset = sOuter + dOuter;
  var sInner = sOffset + dOffset;
  var sStar = sInner + dInner;
  var sFillStar = sStar + dStar;
  var sFillPetal = sFillStar + dFillStar;
  var sFillPoint = sFillPetal + dFillPetal;
  var sEnd = sFillPoint + dFillPoint;

  var keepConstructionLinesVisible = mashrabiyaKeepConstructionLines || mashrabiyaDebugKeepStitchLinesVisible;
  var lineFade = 1 - mashrabiyaPhaseProgress(t, sFillStar, dFillStar + dFillPetal + dFillPoint);
  var lineOpacity = keepConstructionLinesVisible ? 0.92 : (0.9 * lineFade);

  var circleProgress = mashrabiyaPhaseProgress(t, sCircle, dCircle);
  var outerProgress = mashrabiyaPhaseProgress(t, sOuter, dOuter);
  var offsetProgress = mashrabiyaPhaseProgress(t, sOffset, dOffset);
  var innerProgress = mashrabiyaPhaseProgress(t, sInner, dInner);
  var starProgress = mashrabiyaPhaseProgress(t, sStar, dStar);

  drawMashrabiyaClosedStrokeProgress(state.geometry.guideCircleVertices, '#82511f', 2, lineOpacity, circleProgress);
  drawMashrabiyaSequenceProgress(state.geometry.scaffoldPoints || state.geometry.holePoints, state.geometry.firstPolygonSequence, '#82511f', 2, lineOpacity, outerProgress);
  drawMashrabiyaSequenceProgress(state.geometry.scaffoldPoints || state.geometry.holePoints, state.geometry.offsetPolygonSequence, '#82511f', 2, lineOpacity, offsetProgress);
  if (dInner > 0) {
    drawMashrabiyaClosedStrokeProgress(state.geometry.innerGuideCircleVertices, '#82511f', 2, lineOpacity, innerProgress);
  }
  drawMashrabiyaSegmentListProgress(state.geometry.starThreadSegments, '#82511f', 2, lineOpacity, starProgress);

  var selectStar = mashrabiyaPhaseProgress(t, sFillStar, dFillStar);
  var selectPetal = mashrabiyaPhaseProgress(t, sFillPetal, dFillPetal);
  var selectPoint = mashrabiyaPhaseProgress(t, sFillPoint, dFillPoint);

  drawMashrabiyaSelectionOutlines(state.geometry.starRegions && state.geometry.starRegions.length ? state.geometry.starRegions : [state.geometry.starPathVertices], '#c4902f', selectStar);
  drawMashrabiyaSelectionOutlines(state.geometry.petals, '#cf6f2a', selectPetal);
  drawMashrabiyaSelectionOutlines(state.geometry.pointRegions, '#d74f43', selectPoint);

  var starFillProgress = clamp01((selectStar - 0.78) / 0.22);
  var petalFillProgress = clamp01((selectPetal - 0.78) / 0.22);
  var pointFillProgress = clamp01((selectPoint - 0.78) / 0.22);

  drawMashrabiyaFilledGeometry(
    state.geometry,
    starFillProgress,
    petalFillProgress,
    pointFillProgress
  );

  drawMashrabiyaFaceDiagnostics(state.geometry.faceDiagnostics, 0.95);

  state.durationBeats = sEnd;
  clearHighlightedHoleNumbers();
}

function drawMashrabiyaStatic() {
  project.activeLayer.removeChildren();
  var geometry = buildMashrabiyaRosetteGeometry(mashrabiyaFold, mashrabiyaGeometryMode);
  if (mashrabiyaKeepConstructionLines || mashrabiyaDebugKeepStitchLinesVisible) {
    var lineOpacity = 0.92;
    drawMashrabiyaClosedStrokeProgress(geometry.guideCircleVertices, '#82511f', 2, lineOpacity, 1);
    drawMashrabiyaSequenceProgress(geometry.scaffoldPoints || geometry.holePoints, geometry.firstPolygonSequence, '#82511f', 2, lineOpacity, 1);
    drawMashrabiyaSequenceProgress(geometry.scaffoldPoints || geometry.holePoints, geometry.offsetPolygonSequence, '#82511f', 2, lineOpacity, 1);
    drawMashrabiyaClosedStrokeProgress(geometry.innerGuideCircleVertices, '#82511f', 2, lineOpacity, 1);
    drawMashrabiyaSegmentListProgress(geometry.starThreadSegments, '#82511f', 2, lineOpacity, 1);
  }
  drawMashrabiyaFilledGeometry(geometry, 1, 1, 1);
  drawMashrabiyaFaceDiagnostics(geometry.faceDiagnostics, 1);
  clearHighlightedHoleNumbers();
}

function buildMashrabiyaFaceSnapshot(geometry) {
  if (!geometry) return null;
  var diagnostics = geometry.faceDiagnostics || { summary: {}, faces: [] };
  var snapshot = {
    version: 1,
    timestamp: new Date().toISOString(),
    experience: 'mashrabiya',
    fold: geometry.fold,
    geometryMode: geometry.geometryMode,
    summary: diagnostics.summary || {},
    faces: (diagnostics.faces || []).map(function(face) {
      return {
        id: face.id,
        bin: face.bin,
        classification: face.classification,
        radius: Math.round(face.radius * 1000) / 1000,
        angle: Math.round(face.angle * 1000000) / 1000000,
        hasScaffold: !!face.hasScaffold,
        hasStarThread: !!face.hasStarThread,
        hasCircleEdge: !!face.hasCircleEdge,
        starEdgeCount: face.starEdgeCount,
        areaAbs: Math.round(face.areaAbs * 1000) / 1000,
        centroid: {
          x: Math.round(face.centroid.x * 1000) / 1000,
          y: Math.round(face.centroid.y * 1000) / 1000
        },
        vertexCount: face.vertexCount
      };
    })
  };
  return snapshot;
}

function exportMashrabiyaFaceSnapshot() {
  var geometry = buildMashrabiyaRosetteGeometry(mashrabiyaFold, mashrabiyaGeometryMode);
  var snapshot = buildMashrabiyaFaceSnapshot(geometry);
  if (!snapshot) return null;
  try {
    var payload = JSON.stringify(snapshot, null, 2);
    console.log('Mashrabiya face snapshot:', payload);
  } catch (error) {
    console.warn('Unable to serialize Mashrabiya face snapshot.', error);
  }
  return snapshot;
}

function runMashrabiyaAnimationFrame(event) {
  if (!animationActive || !mashrabiyaAnimationState) return;
  var delta = Math.min(event.delta || 0, 0.1);
  mashrabiyaAnimationState.elapsedBeats += delta / Math.max(1e-4, getAnimationSecondsPerSegment());
  renderMashrabiyaAnimationStateFrame(mashrabiyaAnimationState);

  if (mashrabiyaAnimationState.elapsedBeats < mashrabiyaAnimationState.durationBeats) return;

  animationActive = false;
  animationPlaybackState = 'idle';
  view.onFrame = null;
  mashrabiyaAnimationState = null;
  syncAnimateButtonLabel();
  updateMusicPlaybackState();
  scheduleUrlStateSync(false);
  drawMashrabiyaStatic();
}

function animateMashrabiya() {
  animationActive = false;
  view.onFrame = null;
  animationState = null;
  triangulaAnimationState = null;
  squarusAnimationState = null;
  var geometry = buildMashrabiyaRosetteGeometry(mashrabiyaFold, mashrabiyaGeometryMode);
  var timeline = buildMashrabiyaAnimationTimeline(geometry);
  var durationBeats = timeline.dCircle + timeline.dOuter + timeline.dOffset + timeline.dInner + timeline.dStar + timeline.dFillStar + timeline.dFillPetal + timeline.dFillPoint;

  mashrabiyaAnimationState = {
    elapsedBeats: 0,
    durationBeats: durationBeats,
    timeline: timeline,
    geometry: geometry
  };

  animationActive = true;
  animationPlaybackState = 'playing';
  syncAnimateButtonLabel();
  updateMusicPlaybackState();
  scheduleUrlStateSync(false);
  renderMashrabiyaAnimationStateFrame(mashrabiyaAnimationState);
  view.onFrame = runMashrabiyaAnimationFrame;
}

function shouldShowHoleNumbersNow() {
  var holeCount = getCurrentStitchHoleCount();
  if (!isFinite(holeCount)) return false;
  return showHoleNumbers && holeCount <= HOLE_NUMBER_AUTO_HIDE_THRESHOLD;
}

function getOutwardDirectionAtHole(index, ccw) {
  if (!points.length) return new Point(0, -1);

  var n = points.length;
  var prev = points[(index - 1 + n) % n];
  var curr = points[index];
  var next = points[(index + 1) % n];
  var tangent = next.subtract(prev);

  if (tangent.length <= 0.001) {
    var fromCenter = curr.subtract(view.center);
    if (fromCenter.length <= 0.001) return new Point(0, -1);
    return fromCenter.normalize(1);
  }

  var outwardRotation = ccw ? -90 : 90;
  var outward = tangent.normalize(1).rotate(outwardRotation);
  if (outward.length <= 0.001) {
    var fallback = curr.subtract(view.center);
    if (fallback.length <= 0.001) return new Point(0, -1);
    return fallback.normalize(1);
  }

  // Ensure direction points away from center for stable "outer side" placement.
  if (outward.dot(curr.subtract(view.center)) < 0) {
    outward = outward.multiply(-1);
  }

  return outward.normalize(1);
}

function getOutwardDirectionAtHoleFromRing(ringPoints, index, ccw, invert) {
  if (!ringPoints || !ringPoints.length) return new Point(0, -1);

  var n = ringPoints.length;
  var prev = ringPoints[(index - 1 + n) % n];
  var curr = ringPoints[index];
  var next = ringPoints[(index + 1) % n];
  var tangent = next.subtract(prev);

  if (tangent.length <= 0.001) {
    var fromCenter = curr.subtract(view.center);
    if (fromCenter.length <= 0.001) return new Point(0, -1);
    var fallbackDirection = fromCenter.normalize(1);
    return invert ? fallbackDirection.multiply(-1) : fallbackDirection;
  }

  var outwardRotation = ccw ? -90 : 90;
  var outward = tangent.normalize(1).rotate(outwardRotation);
  if (outward.length <= 0.001) {
    var fallback = curr.subtract(view.center);
    if (fallback.length <= 0.001) return new Point(0, -1);
    outward = fallback.normalize(1);
  }

  if (outward.dot(curr.subtract(view.center)) < 0) {
    outward = outward.multiply(-1);
  }

  outward = outward.normalize(1);
  return invert ? outward.multiply(-1) : outward;
}

function getBoundsExtentAlongDirection(item, direction) {
  var dir = direction.normalize(1);
  var center = item.position;
  var corners = [
    item.bounds.topLeft,
    item.bounds.topRight,
    item.bounds.bottomLeft,
    item.bounds.bottomRight
  ];
  var maxProjection = 0;
  for (var i = 0; i < corners.length; i++) {
    var projection = corners[i].subtract(center).dot(dir);
    if (projection > maxProjection) {
      maxProjection = projection;
    }
  }
  return Math.max(0, maxProjection);
}

function getHoleNumberFontSize(holeCount) {
  if (holeCount >= 70) return 9;
  if (holeCount >= 55) return 9.5;
  return 10;
}

function getHoleLabelOffsetFromExtent(extent, borderClearance, holeClearance) {
  var borderPad = isFinite(borderClearance) ? borderClearance : LABEL_BORDER_CLEARANCE;
  var holePad = isFinite(holeClearance) ? holeClearance : LABEL_HOLE_CLEARANCE;
  var minOffset = 3 + holePad + extent;
  var maxOffset = BORDER_OUTER_GAP - (BORDER_STROKE_WIDTH * 0.5 + borderPad + extent);
  // Interpolate within the feasible band so both hole and border clearances
  // influence the result. This makes padding constants responsive.
  var preferredOffset = minOffset + ((maxOffset - minOffset) * LABEL_OUTER_BIAS);
  var clampedOffset;

  if (maxOffset >= minOffset) {
    clampedOffset = Math.max(minOffset, Math.min(preferredOffset, maxOffset));
  } else {
    // Fallback: allow a very small overshoot beyond the border band so labels
    // remain visually even without drifting far from their ring holes.
    var overflowAllowance = 0.8;
    clampedOffset = Math.min(minOffset, maxOffset + overflowAllowance);
  }

  if (!isFinite(clampedOffset)) {
    clampedOffset = Math.max(4, BORDER_OUTER_GAP * 0.6);
  }

  return {
    offset: clampedOffset,
    minOffset: minOffset,
    maxOffset: maxOffset
  };
}

function estimateTextExtentAlongDirection(text, fontSize) {
  var len = String(text || '').length;
  if (len <= 1) return fontSize * 0.28;
  if (len === 2) return fontSize * 0.46;
  return fontSize * (0.56 + Math.min(2, len - 2) * 0.1);
}

function formatSvgNumber(value) {
  return String(Math.round(value * 1000) / 1000);
}

function colorToSvg(value) {
  if (typeof value === 'string') {
    return value;
  }
  if (value && typeof value.toCSS === 'function') {
    return value.toCSS(true);
  }
  return '#000000';
}

function svgPathFromPoints(vertices) {
  if (!vertices || !vertices.length) return '';
  var parts = ['M ' + formatSvgNumber(vertices[0].x) + ' ' + formatSvgNumber(vertices[0].y)];
  for (var i = 1; i < vertices.length; i++) {
    parts.push('L ' + formatSvgNumber(vertices[i].x) + ' ' + formatSvgNumber(vertices[i].y));
  }
  parts.push('Z');
  return parts.join(' ');
}

function getTimestampLabel() {
  var now = new Date();
  var y = now.getFullYear();
  var m = String(now.getMonth() + 1).padStart(2, '0');
  var d = String(now.getDate()).padStart(2, '0');
  var hh = String(now.getHours()).padStart(2, '0');
  var mm = String(now.getMinutes()).padStart(2, '0');
  var ss = String(now.getSeconds()).padStart(2, '0');
  return y + m + d + '-' + hh + mm + ss;
}

