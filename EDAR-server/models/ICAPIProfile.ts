export interface ICAPIProfile {
  commander: Commander;
  ship: Ship;
  suit?: any;
  lastSystem: LastSystem;
  lastStarport: LastStarport;
  loadouts: any[];
  loadout: any[];
  suits: any[];
}

interface Rank {
      combat: number;
      trade: number;
      explore: number;
      crime: number;
      service: number;
      empire: number;
      federation: number;
      power: number;
      cqc: number;
      soldier: number;
      exobiologist: number;
  }

interface Capabilities {
      AllowCobraMkIV: boolean;
      Horizons: boolean;
      Odyssey: boolean;
  }

interface Commander {
      id: number;
      name: string;
      credits: number;
      debt: number;
      currentShipId: number;
      alive: boolean;
      docked: boolean;
      onfoot: boolean;
      rank: Rank;
      capabilities: Capabilities;
  }

interface Value {
      hull: number;
      modules: number;
      cargo: number;
      total: number;
      unloaned: number;
  }

interface Station {
      id: number;
      name: string;
  }

interface Starsystem {
      id: number;
      name: string;
      systemaddress: number;
  }

interface Health {
      hull: number;
      shield: number;
      shieldup: boolean;
      integrity: number;
      paintwork: number;
  }

interface Module {
      id: number;
      name: string;
      locName: string;
      locDescription: string;
      value: number;
      free: boolean;
      health: number;
      on: boolean;
      priority: number;
  }

interface SmallHardpoint1 {
      module: Module;
  }

interface Module2 {
      id: number;
      name: string;
      locName: string;
      locDescription: string;
      value: number;
      free: boolean;
      health: number;
      on: boolean;
      priority: number;
  }

interface SmallHardpoint2 {
      module: Module2;
  }

interface Module3 {
      id: number;
      name: string;
      locName: string;
      locDescription: string;
      value: number;
      free: boolean;
      health: number;
      on: boolean;
      priority: number;
  }

interface Armour {
      module: Module3;
  }

interface Module4 {
      id: number;
      name: string;
      locName: string;
      locDescription: string;
      value: number;
      free: boolean;
      health: number;
      on: boolean;
      priority: number;
  }

interface PowerPlant {
      module: Module4;
  }

interface Module5 {
      id: number;
      name: string;
      locName: string;
      locDescription: string;
      value: number;
      free: boolean;
      health: number;
      on: boolean;
      priority: number;
  }

interface MainEngines {
      module: Module5;
  }

interface Module6 {
      id: number;
      name: string;
      locName: string;
      locDescription: string;
      value: number;
      free: boolean;
      health: number;
      on: boolean;
      priority: number;
  }

interface FrameShiftDrive {
      module: Module6;
  }

interface Module7 {
      id: number;
      name: string;
      locName: string;
      locDescription: string;
      value: number;
      free: boolean;
      health: number;
      on: boolean;
      priority: number;
  }

interface LifeSupport {
      module: Module7;
  }

interface Module8 {
      id: number;
      name: string;
      locName: string;
      locDescription: string;
      value: number;
      free: boolean;
      health: number;
      on: boolean;
      priority: number;
  }

interface PowerDistributor {
      module: Module8;
  }

interface Module9 {
      id: number;
      name: string;
      locName: string;
      locDescription: string;
      value: number;
      free: boolean;
      health: number;
      on: boolean;
      priority: number;
  }

interface Radar {
      module: Module9;
  }

interface Module10 {
      id: number;
      name: string;
      locName: string;
      locDescription: string;
      value: number;
      free: boolean;
      health: number;
      on: boolean;
      priority: number;
  }

interface FuelTank {
      module: Module10;
  }

interface Module11 {
      id: number;
      name: string;
      locName: string;
      locDescription: string;
      value: number;
      free: boolean;
      health: number;
      on: boolean;
      priority: number;
  }

interface Slot01Size5 {
      module: Module11;
  }

interface Module12 {
      id: number;
      name: string;
      locName: string;
      locDescription: string;
      value: number;
      free: boolean;
      health: number;
      on: boolean;
      priority: number;
  }

interface Slot02Size5 {
      module: Module12;
  }

interface Module13 {
      id: number;
      name: string;
      locName: string;
      locDescription: string;
      value: number;
      free: boolean;
      health: number;
      on: boolean;
      priority: number;
  }

interface Slot03Size4 {
      module: Module13;
  }

interface Module14 {
      id: number;
      name: string;
      locName: string;
      locDescription: string;
      value: number;
      free: boolean;
      health: number;
      on: boolean;
      priority: number;
  }

interface Slot04Size4 {
      module: Module14;
  }

interface Module15 {
      id: number;
      name: string;
      locName: string;
      locDescription: string;
      value: number;
      free: boolean;
      health: number;
      on: boolean;
      priority: number;
  }

interface Slot05Size3 {
      module: Module15;
  }

interface Module16 {
      id: number;
      name: string;
      locName: string;
      locDescription: string;
      value: number;
      free: boolean;
      health: number;
      on: boolean;
      priority: number;
  }

interface Slot06Size2 {
      module: Module16;
  }

interface Module17 {
      id: number;
      name: string;
      locName: string;
      locDescription: string;
      value: number;
      free: boolean;
      health: number;
      on: boolean;
      priority: number;
  }

interface Slot08Size1 {
      module: Module17;
  }

interface Module18 {
      id: number;
      name: string;
      locName: string;
      locDescription: string;
      value: number;
      free: boolean;
      health: number;
      on: boolean;
      priority: number;
  }

interface PlanetaryApproachSuite {
      module: Module18;
  }

interface Module19 {
      id: number;
      name: string;
      locName: string;
      locDescription: string;
      value: number;
      free: boolean;
      health: number;
      on: boolean;
      priority: number;
  }

interface VesselVoice {
      module: Module19;
  }

interface Modules {
      SmallHardpoint1: SmallHardpoint1;
      SmallHardpoint2: SmallHardpoint2;
      Armour: Armour;
      PowerPlant: PowerPlant;
      MainEngines: MainEngines;
      FrameShiftDrive: FrameShiftDrive;
      LifeSupport: LifeSupport;
      PowerDistributor: PowerDistributor;
      Radar: Radar;
      FuelTank: FuelTank;
      Slot01_Size5: Slot01Size5;
      Slot02_Size5: Slot02Size5;
      Slot03_Size4: Slot03Size4;
      Slot04_Size4: Slot04Size4;
      Slot05_Size3: Slot05Size3;
      Slot06_Size2: Slot06Size2;
      Slot08_Size1: Slot08Size1;
      PlanetaryApproachSuite: PlanetaryApproachSuite;
      VesselVoice: VesselVoice;
  }

interface Ship {
      id: number;
      name: string;
      value: Value;
      free: boolean;
      station: Station;
      starsystem: Starsystem;
      alive: boolean;
      health: Health;
      cockpitBreached: boolean;
      oxygenRemaining: number;
      modules: Modules;
  }

interface LastSystem {
      id: number;
      name: string;
      faction: string;
  }

interface Services {
      dock: string;
      contacts: string;
      exploration: string;
      socialspace: string;
      commodities: string;
      refuel: string;
      repair: string;
      rearm: string;
      outfitting: string;
      crewlounge: string;
      powerplay: string;
      searchrescue: string;
      stationmenu: string;
      shop: string;
      apexinterstellar: string;
      bartender: string;
      frontlinesolutions: string;
      pioneersupplies: string;
      vistagenomics: string;
      engineer: string;
      blackmarket: string;
      livery: string;
  }

interface LastStarport {
      id: number;
      services: Services;
      name: string;
      faction: string;
      minorfaction: string;
  }
