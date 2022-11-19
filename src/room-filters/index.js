const fs = require('fs');
const path = require('path');
const logger = require('../logger');

const readBlockedProjects = () => {
  try {
    const contents = fs.readFileSync(path.join(__dirname, 'filter.txt'), 'utf-8');
    return contents.trim().split('\n');
  } catch (e) {
    return [];
  }
};

const blockedProjects = readBlockedProjects();
logger.info(`Blocked projects: ${blockedProjects.length}`);

const isProjectBlocked = (id) => blockedProjects.includes(id);

module.exports = isProjectBlocked;
