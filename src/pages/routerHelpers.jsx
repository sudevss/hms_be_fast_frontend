/* eslint-disable import/prefer-default-export */
/* eslint-disable spellcheck/spell-checker */
export const hasNoAccess = (domainData) => {
  const { role, editRoleStream = [], viewRoleStream = [] } = domainData;

  const isEmptyStreamData = (streamData) =>
    streamData.length > 0 &&
    streamData.every(
      (ele) =>
        ele.stream === "" &&
        ele.department.length === 0 &&
        ele.editRoleTower?.tower?.length === 0 &&
        ele.editRoleTower?.subTower?.length === 0
    );

  return (
    role === "User" &&
    isEmptyStreamData(editRoleStream) &&
    isEmptyStreamData(viewRoleStream)
  );
};
