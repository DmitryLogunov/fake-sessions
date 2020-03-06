import { find } from 'lodash';
import { IRelationship, IRelationshipLink } from '../types/config';

/**
 * Returns relationship table
 *
 * @param relationshipName
 */
export const getRelationshipTable = (resource: string, relationshipName: string): string | null => {
  const accountContextRolesRelationships: IRelationship = find(global.config.relationships, (rel: IRelationship) => {
    return rel.resource === resource;
  });

  if (!accountContextRolesRelationships) {
    return;
  }

  const relationshipsLink: IRelationshipLink = find(
    accountContextRolesRelationships.links,
    (link: IRelationshipLink) => {
      return link.name === relationshipName;
    }
  );

  if (!relationshipsLink) {
    return;
  }

  return relationshipsLink.table;
};
