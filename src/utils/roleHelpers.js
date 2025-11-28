//src\utils\roleHelpers.js
const DEBUG = false;

export const getDepartmentFromRole = (userRole, userDepartment = null) => {
  if (DEBUG) console.log('getDepartmentFromRole called with:', { userRole, userDepartment });

  const roleDepartmentMap = {
    police_admin: 'PNP',
    police_responder: 'PNP',
    fire_admin: 'BFP',
    fire_responder: 'BFP',
    medical_admin: 'MDDRMO',
    medical_responder: 'MDDRMO',
    super_admin: ''
  };

  if (userDepartment) {
    const departmentMap = {
      police: 'PNP',
      fire: 'BFP',
      medical: 'MDDRMO',
      PNP: 'PNP',
      BFP: 'BFP',
      MDDRMO: 'MDDRMO',
      pnp: 'PNP',
      bfp: 'BFP',
      mddrmo: 'MDDRMO'
    };

    const mappedDepartment = departmentMap[userDepartment] || userDepartment;
    if (DEBUG) console.log('Mapped department from userDepartment:', mappedDepartment);
    return mappedDepartment;
  }

  const roleBasedDepartment = roleDepartmentMap[userRole] || '';
  if (DEBUG) console.log('Department from role mapping:', roleBasedDepartment);
  return roleBasedDepartment;
};
