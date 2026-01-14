// src/utils/debugCustomers.ts
// Utilidad para debugging de clientes

export function logCustomerData(customer: any, source: string = 'Unknown') {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 CUSTOMER DEBUG - ${source}`);
    console.log(`${'='.repeat(60)}`);

    console.log('\n🔑 Identificación:');
    console.log('  CustomerId:', customer.CustomerId || customer.customerId);
    console.log('  SystemCode:', customer.SystemCode || customer.systemCode);
    console.log('  NumberId:', customer.NumberId || customer.identificationNumber);

    console.log('\n👤 Información Personal:');
    console.log('  FirstName:', customer.FirstName || customer.firstName);
    console.log('  LastName:', customer.LastName || customer.lastName);
    console.log('  FullName:', customer.FullName || customer.fullName);
    console.log('  DateOfBirth:', customer.DateOfBirth || customer.dateOfBirth);

    console.log('\n📧 Contacto:');
    console.log('  Email:', customer.Email || customer.email);
    console.log('  PhoneNumber:', customer.PhoneNumber || customer.phone);

    console.log('\n🏠 Dirección:');
    console.log('  Address:', customer.Address || customer.address);
    console.log('  City:', customer.City || customer.city);
    console.log('  State:', customer.State || customer.state);
    console.log('  Country:', customer.Country || customer.country);
    console.log('  ZipCode:', customer.ZipCode || customer.zipCode);

    console.log('\n🎖️ Clasificación:');
    console.log('  CustomerTypeName:', customer.CustomerTypeName || customer.customerTypeName);
    console.log('  TierName:', customer.TierName || customer.tierName);
    console.log('  Active:', customer.Active !== undefined ? customer.Active : customer.active);
    console.log('  Status:', customer.Status || customer.status);

    console.log('\n📅 Fechas:');
    console.log('  RegistrationDate:', customer.RegistrationDate || customer.registrationDate);
    console.log('  CreatedDate:', customer.CreatedDate);
    console.log('  LastPurchaseDate:', customer.LastPurchaseDate || customer.lastPurchaseDate);

    console.log('\n📝 Otros:');
    console.log('  ProfileImage:', customer.ProfileImage || customer.profileImage);
    console.log('  Notes:', customer.Notes || customer.notes);
    console.log('  TotalPurchases:', customer.TotalPurchases || customer.totalPurchases);
    console.log('  TotalRegisters:', customer.TotalRegisters);
    console.log('  RowNumber:', customer.RowNumber);

    console.log(`\n${'='.repeat(60)}\n`);
}

export function logCustomerList(customers: any[], source: string = 'API Response') {
    console.log(`\n${'*'.repeat(60)}`);
    console.log(`📋 CUSTOMER LIST - ${source}`);
    console.log(`Total: ${customers.length} clientes`);
    console.log(`${'*'.repeat(60)}\n`);

    if (customers.length > 0) {
        console.log('Muestra del primer cliente:');
        logCustomerData(customers[0], 'First in List');

        if (customers.length > 1) {
            console.log('\n📊 Resumen de todos los clientes:');
            customers.forEach((customer, index) => {
                const name = customer.FullName || customer.fullName || `${customer.FirstName} ${customer.LastName}`;
                const id = customer.CustomerId || customer.customerId;
                console.log(`  ${index + 1}. ${name} (ID: ${id})`);
            });
        }
    } else {
        console.log('⚠️ Lista vacía - no hay clientes');
    }

    console.log(`\n${'*'.repeat(60)}\n`);
}
