class GameTile {
  constructor(x=0, y=0, value=2048) {
    this.x = x;
    this.y = y;
    this.value = value;

    // Establish origin, for actuating to screen
    const originRect = document.getElementById("originCell").getBoundingClientRect();
    this.x0px = originRect.left;
    this.y0px = originRect.top;

    // Other bits for actuating to screen
    this.size = 110;
    this.element = document.createElement('div')
    this.element.className = 'tile'
    document.getElementById('tile-container').appendChild(this.element)
    this.valueTextNode = document.createTextNode(value);
    this.element.appendChild(this.valueTextNode);
  }

  move(dx, dy) {
    this.x += dx;
    this.y += dy;
    this.actuate();
  }

  actuate() {
    var s = this.element.style;
    var self = this;
    window.requestAnimationFrame(function() {
      s.WebkitTransform = "translate("+(self.x0px + self.size*self.x).toString()+"px,"+(self.y0px + self.size*self.y).toString()+"px)";
    });
    this.valueTextNode.nodeValue = this.value;
  }

  delete() {
    document.getElementById('tile-container').removeChild(this.element)
  }
}

const GameController = {
  init() {
    // Generate board using null spaces
    this.allTiles = []
    for (i = 0; i < 4; i++) {
      this.allTiles.push([null, null, null, null])
    }

    // Add test tiles
    this.addTile(0, 1, 2);
    this.addTile(1, 2, 2);
    this.addTile(0, 3, 4);

    // Set up input listener
    document.addEventListener('keydown', (event) => {
      const keyName = event.key;
      // console.log(keyName);
      switch (keyName) {
        case 'ArrowLeft':
          this.horizontalMove(-1);
          break;
        case 'ArrowRight':
          this.horizontalMove(1);
          break;
        case 'ArrowUp':
          this.verticalMove(-1);
          break;
        case 'ArrowDown':
          this.verticalMove(1);
          break;
      }
    });
  },

  addTile(x, y, val) {
    // Adds a tile at a specified position.
    newTile = new GameTile(x, y, val);
    // this.allTiles.push(newTile);
    this.allTiles[y][x] = newTile;
    newTile.actuate();
  },

  getUnoccupiedPositions() {
    // Returns x, y values of all unoccupied spaces on the board.
    unoccupied = []
    for(r=0; r<4; r++) {
      for(c=0; c<4; c++) {
        if (this.allTiles[r][c] == null) {
          unoccupied.push([c, r])
        }
      }
    }
    return unoccupied
  },

  addRandomTile() {
    value =  Math.random() < 0.8 ? 2 : 4;
    var unoccupied = this.getUnoccupiedPositions();
    [x, y] = unoccupied[Math.floor(Math.random()*unoccupied.length)];
    this.addTile(x, y, value);
  },

  reApplyCoordinates() {
    // Moving tiles adjusts their position in the game grid, but not their
    // x and y coordinates. This function corrects those coordinates.
    for(r=0; r<4; r++) {
      for(c=0; c<4; c++) {
        var tile = this.allTiles[r][c]
        if (tile != null) {
          tile.x = c
          tile.y = r
          tile.actuate()
        }
      }
    }
  },

  horizontalMove(dx) {
    // Moves all tiles horizontally. dx = 1 if to the right, -1 if to the left
    var newPositions = []
    var self = this;
    this.allTiles.forEach(function(row) {
      var newRow = [];
      row.forEach(function(tile) {
        if (tile != null) {
          newRow.push(tile)
        }
      });

      self.performMerges(newRow);

      while (newRow.length < 4) {
        if (dx < 1) {
          newRow.push(null);
        }
        else {
          newRow.unshift(null);
        }
      }
      newPositions.push(newRow);
      });
  this.allTiles = newPositions;
  this.reApplyCoordinates();

  // Add a random tile
  this.addRandomTile();
  },

  mergeTiles(tile1, tile2) {
    // Merges tile2 into tile1.
    // Increase the value of tile1
    tile1.value = tile1.value + tile2.value;
    tile2.delete();
  },

  performMerges(sequence) {
    // Check a sequence (either a newly gathered row or column) of tiles
    // for merges. If two tiles can be merged, merge them!
    var i = 0;
    while (i < sequence.length-1) {
      if (sequence[i].value == sequence[i+1].value) {
        // The first merging tile is updated. The second tile is deleted.
        this.mergeTiles(sequence[i], sequence[i+1]);
        sequence.splice(i+1, 1);
      }
      i += 1;
    }
  },

  verticalMove(dy) {
    // Moves all tiles vertically. dy = 1 if down, 0 if up
    for(c=0; c<4; c++) {
      // For each column, coalesce the non-null tiles into a 1D array
      var newColumn = []

      for(r=0; r<4; r++) {
        var tile = this.allTiles[r][c];
        if (tile != null) {
          newColumn.push(tile);
        }
      }

      this.performMerges(newColumn);

      // Expand the column with nulls to length 4
      while (newColumn.length < 4) {
        if (dy < 1) {
          newColumn.push(null);
        }
        else {
          newColumn.unshift(null);
        }
      }
      // Replace the original column with this one
      for(r=0; r<4; r++) {
        this.allTiles[r][c] = newColumn[r];
      }
    }
  this.reApplyCoordinates();

  // Add a random tile
  this.addRandomTile();
  },
};

addEventListener("load", () => {
  GameController.init();
});
