import { db } from '..';

import {loadSqlStringFromFile} from '../database_tools/loadSqlStringFromFile';
import {Router} from 'express';

const router = Router();

const query = loadSqlStringFromFile('/api_sql/find_system_by_name.sql');

router.get('/:PartialSystemName?', (req, res) => {

  // console.log('hmm');
  const name = req.params.PartialSystemName + '%';
  if(name === '...%' || req.params.PartialSystemName?.length === 0) {
    res.json([]);
  }
  const result = db.prepare(query).all(name);

  const listOfSystems: string[] = [];
  result.forEach(r => {
    listOfSystems.push(r.name);
  });

  res.json(listOfSystems);
});

// router.get('/:markle', (req, res) => {
//   res.send('yo!' + req.params.markle);
// });

export default router;
