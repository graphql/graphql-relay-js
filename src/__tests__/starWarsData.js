// @flow strict

/**
 * This defines a basic set of data for our Star Wars Schema.
 *
 * This data is hard coded for the sake of the demo, but you could imagine
 * fetching this data from a backend service rather than from hardcoded
 * JSON objects in a more complex demo.
 */

const xwing = {
  id: '1',
  name: 'X-Wing',
};

const ywing = {
  id: '2',
  name: 'Y-Wing',
};

const awing = {
  id: '3',
  name: 'A-Wing',
};

// Yeah, technically it's Corellian. But it flew in the service of the rebels,
// so for the purposes of this demo it's a rebel ship.
const falcon = {
  id: '4',
  name: 'Millenium Falcon',
};

const homeOne = {
  id: '5',
  name: 'Home One',
};

const tieFighter = {
  id: '6',
  name: 'TIE Fighter',
};

const tieInterceptor = {
  id: '7',
  name: 'TIE Interceptor',
};

const executor = {
  id: '8',
  name: 'Executor',
};

const rebels = Object.freeze({
  id: '1',
  name: 'Alliance to Restore the Republic',
  ships: ['1', '2', '3', '4', '5'],
});

const empire = Object.freeze({
  id: '2',
  name: 'Galactic Empire',
  ships: ['6', '7', '8'],
});

const data = Object.freeze({
  Faction: {
    '1': rebels,
    '2': empire,
  },
  Ship: {
    '1': xwing,
    '2': ywing,
    '3': awing,
    '4': falcon,
    '5': homeOne,
    '6': tieFighter,
    '7': tieInterceptor,
    '8': executor,
  },
});

type Ship = {
  id: string,
  name: string,
};

type Faction = {
  id: string,
  name: string,
  ships: $ReadOnlyArray<string>,
};

let nextShip = 9;
export function createShip(shipName: string, factionId: string): Ship {
  const newShip = {
    id: String(nextShip++),
    name: shipName,
  };
  data.Ship[newShip.id] = newShip;
  data.Faction[factionId].ships.push(newShip.id);
  return newShip;
}

export function getShip(id: string): Ship {
  return data.Ship[id];
}

export function getFaction(id: string): Faction {
  return data.Faction[id];
}

export function getRebels(): Faction {
  return rebels;
}

export function getEmpire(): Faction {
  return empire;
}
