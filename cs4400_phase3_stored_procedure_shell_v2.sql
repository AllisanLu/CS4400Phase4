-- CS4400: Introduction to Database Systems
-- Bank Management Project - Phase 3 (v2)
-- Generating Stored Procedures & Functions for the Use Cases
-- April 4th, 2022

-- implement these functions and stored procedures on the project database
use bank_management;

-- [1] create_corporation()
-- This stored procedure creates a new corporation
drop procedure if exists create_corporation;
delimiter //
create procedure create_corporation (in ip_corpID varchar(100),
    in ip_shortName varchar(100), in ip_longName varchar(100),
    in ip_resAssets integer)
begin
    insert into corporation values (ip_corpID, ip_shortName, ip_longName, ip_resAssets);
end //
delimiter ;

-- [2] create_bank()
-- This stored procedure creates a new bank that is owned by an existing corporation
-- The corporation must also be managed by a valid employee [being a manager doesn't leave enough time for other jobs]
drop procedure if exists create_bank;
delimiter //
create procedure create_bank (in ip_bankID varchar(100), in ip_bankName varchar(100),
    in ip_street varchar(100), in ip_city varchar(100), in ip_state char(2),
    in ip_zip char(5), in ip_resAssets integer, in ip_corpID varchar(100),
    in ip_manager varchar(100), in ip_bank_employee varchar(100))
sp_main: begin
    if exists (select 1 from bank where manager=ip_manager) then leave sp_main; end if;
    if not exists (select corpID from corporation where corpID = ip_corpID) then leave sp_main; end if;
    if not exists (select perID from employee where perID=ip_manager) then leave sp_main; end if;
    if not exists (select perID from employee where perID=ip_bank_employee) then leave sp_main; end if;
    
    insert into bank values (ip_bankID, ip_bankName, ip_street, ip_city, ip_state, ip_zip, ip_resAssets, ip_corpID, ip_manager);
    insert into workfor values (ip_bankID, ip_bank_employee);
end //
delimiter ;


-- [3] start_employee_role()
-- If the person exists as an admin or employee then don't change the database state [not allowed to be admin along with any other person-based role]
-- If the person doesn't exist then this stored procedure creates a new employee
-- If the person exists as a customer then the employee data is added to create the joint customer-employee role
drop procedure if exists start_employee_role;
delimiter //
create procedure start_employee_role (in ip_perID varchar(100), in ip_taxID char(11),
    in ip_firstName varchar(100), in ip_lastName varchar(100), in ip_birthdate date,
    in ip_street varchar(100), in ip_city varchar(100), in ip_state char(2),
    in ip_zip char(5), in ip_dtJoined date, in ip_salary integer,
    in ip_payments integer, in ip_earned integer, in emp_password  varchar(100))
sp_main: begin
    -- Implement your code here
    if ip_perID in (select perID from system_admin) or ip_perID in (select perID from employee) then leave sp_main; end if;
    if ip_perID in (select perID from customer) then insert into employee values (ip_perID, ip_salary, ip_payments, ip_earned); leave sp_main; end if;

    insert into person values (ip_perID, emp_password);
    insert into bank_user values (ip_perID, ip_taxID, ip_birthdate, ip_firstName, ip_lastName, ip_dtJoined, ip_street, ip_city, ip_state, ip_zip);
    insert into employee values (ip_perID, ip_salary, ip_payments, ip_earned);
    

end //
delimiter ;

-- [4] start_customer_role()
-- If the person exists as an admin or customer then don't change the database state [not allowed to be admin along with any other person-based role]
-- If the person doesn't exist then this stored procedure creates a new customer
-- If the person exists as an employee then the customer data is added to create the joint customer-employee role
drop procedure if exists start_customer_role;
delimiter //
create procedure start_customer_role (in ip_perID varchar(100), in ip_taxID char(11),
    in ip_firstName varchar(100), in ip_lastName varchar(100), in ip_birthdate date,
    in ip_street varchar(100), in ip_city varchar(100), in ip_state char(2),
    in ip_zip char(5), in ip_dtJoined date, in cust_password varchar(100))
sp_main: begin
    -- Implement your code here
    if ip_perID in (select perID from system_admin) or ip_perID in (select perID from customer) then leave sp_main; end if;
    if ip_perID in (select perID from employee) then insert into customer values (ip_perID); leave sp_main; end if;
     
    insert into person values (ip_perID, cust_password);
    insert into bank_user values (ip_perID, ip_taxID, ip_birthdate, ip_firstName, ip_lastName, ip_dtJoined, ip_street, ip_city, ip_state, ip_zip);
    insert into customer values (ip_perID);
end //
delimiter ;

-- [5] stop_employee_role()
-- If the person doesn't exist as an employee then don't change the database state
-- If the employee manages a bank or is the last employee at a bank then don't change the database state [each bank must have a manager and at least one employee]
-- If the person exists in the joint customer-employee role then the employee data must be removed, but the customer information must be maintained
-- If the person exists only as an employee then all related person data must be removed
drop procedure if exists stop_employee_role;
delimiter //
create procedure stop_employee_role (in ip_perID varchar(100))
sp_main: begin
    -- Implement your code here
    if ip_perID not in (select perID from employee) then leave sp_main; end if;
    if ip_perID in (select manager from bank) then leave sp_main; end if;
    if (select count(*) from workFor where bankID in (select bankID from workFor where ip_perID = perID)) = 1 then leave sp_main; end if;
    
    delete from workFor where ip_perID = perID;
    delete from employee where ip_perID = perID;
    
    if ip_perID not in (select perID from customer) then     
        delete from bank_user where ip_perID = perID;
        delete from person where ip_perID = perID;
    end if;

end //
delimiter ;

-- [6] stop_customer_role()
-- If the person doesn't exist as an customer then don't change the database state
-- If the customer is the only holder of an account then don't change the database state [each account must have at least one holder]
-- If the person exists in the joint customer-employee role then the customer data must be removed, but the employee information must be maintained
-- If the person exists only as a customer then all related person data must be removed
drop procedure if exists stop_customer_role;
delimiter //
create procedure stop_customer_role (in ip_perID varchar(100))
sp_main: begin
    if ip_perID not in (select perID from customer) then leave sp_main; end if;
    if 1 in (select count(*) from access
    join (select perID, bankID, accountID from access where perID=ip_perID) as accts on access.bankID=accts.bankID and access.accountID=accts.accountID group by access.bankID, access.accountID)
    then leave sp_main; end if;
    
    delete from customer_contacts where ip_perID=perID;
    delete from access where ip_perID=perID;
    delete from customer where ip_perID=perID;
    
    if ip_perID not in (select perID from employee) then delete from bank_user where ip_perID=perID;
        delete from person where ip_perID=perID;
    end if;
end //
delimiter ;

-- [7] hire_worker()
-- If the person is not an employee then don't change the database state
-- If the worker is a manager then then don't change the database state [being a manager doesn't leave enough time for other jobs]
-- Otherwise, the person will now work at the assigned bank in addition to any other previous work assignments
-- Also, adjust the employee's salary appropriately
drop procedure if exists hire_worker;
delimiter //
create procedure hire_worker (in ip_perID varchar(100), in ip_bankID varchar(100),
    in ip_salary integer)
sp_main: begin
    if ip_perID not in (select perID from employee) then leave sp_main; end if;
    if ip_perID in (select manager from bank) then leave sp_main; end if;
    
    
    insert into workFor values (ip_bankID, ip_perID);
    update employee set salary = coalesce(salary, 0) + ip_salary where perID = ip_perID;
    

end //
delimiter ;

-- [8] replace_manager()
-- If the new person is not an employee then don't change the database state
-- If the new person is a manager or worker at any bank then don't change the database state [being a manager doesn't leave enough time for other jobs]
-- Otherwise, replace the previous manager at that bank with the new person
-- The previous manager's association as manager of that bank must be removed
-- Adjust the employee's salary appropriately
drop procedure if exists replace_manager;
delimiter //
create procedure replace_manager (in ip_perID varchar(100), in ip_bankID varchar(100),
    in ip_salary integer)
sp_main: begin
    -- Implement your code here
    if ip_perID not in (select perID from employee) then leave sp_main; end if;
    if ip_perID in (select manager from bank) then leave sp_main; end if;
    if ip_perID in (select perID from workFor) then leave sp_main; end if;
    
    update bank set manager = ip_perID where ip_bankID = bank.bankID;    
    update employee set salary = coalesce(salary, 0) + ip_salary where perID = ip_perID;

-- insert into workFor values (ip_bankID, ip_perID);

end //
delimiter ;

-- [9] add_account_access()
-- If the account does not exist, create a new account. If the account exists, add the customer to the account
-- When creating a new account:
    -- If the person opening the account is not an admin then don't change the database state
    -- If the intended customer (i.e. ip_customer) is not a customer then don't change the database state
    -- Otherwise, create a new account owned by the designated customer
    -- The account type will be determined by the enumerated ip_account_type variable
    -- ip_account_type in {checking, savings, market}
-- When adding a customer to an account:
    -- If the person granting access is not an admin or someone with access to the account then don't change the database state
    -- If the intended customer (i.e. ip_customer) is not a customer then don't change the database state
    -- Otherwise, add the new customer to the existing account
drop procedure if exists add_account_access;
delimiter //
create procedure add_account_access (in ip_requester varchar(100), in ip_customer varchar(100),
    in ip_account_type varchar(10), in ip_bankID varchar(100),
    in ip_accountID varchar(100), in ip_balance integer, in ip_interest_rate integer,
    in ip_dtDeposit date, in ip_minBalance integer, in ip_numWithdrawals integer,
    in ip_maxWithdrawals integer, in ip_dtShareStart date)
begin
    -- Check if account exists
    if exists(select bankID, accountID from bank_account where bankID = ip_bankID and accountID = ip_accountID) then
        -- Check if ip_customer is a customer and the requester is an admin or has access to said account
        if (ip_customer in (select perID from customer) and (ip_requester in (select perID from system_admin) or ip_requester in (select perID from access where accountID = ip_accountID and bankID = ip_bankID))) then
            insert into access values (ip_customer, ip_bankID, ip_accountID, ip_dtShareStart, null);    
        end if;
    else -- create a new account
        -- make sure requester is admin and customer is a customer
        if (ip_requester in (select perID from system_admin) and ip_customer in (select perID from customer)) then
            insert into bank_account values (ip_bankID, ip_accountID, ip_balance);
            insert into access values (ip_customer, ip_bankID, ip_accountID, ip_dtShareStart, null);
            if (ip_account_type = 'checking') then
                insert into checking values (ip_bankID, ip_accountID, null, null, null, null);
            elseif (ip_account_type = 'savings') then
                insert into interest_bearing values (ip_bankID, ip_accountID, ip_interest_rate, ip_dtDeposit);
                insert into savings values (ip_bankID, ip_accountID, ip_minBalance);
            elseif (ip_account_type = 'market') then
                insert into interest_bearing values (ip_bankID, ip_accountID, ip_interest_rate, ip_dtDeposit);
                insert into market (bankID, accountID, maxWithdrawals, numWithdrawals) values (ip_bankID, ip_accountID, ip_maxWithdrawals, ip_numWithdrawals);
            end if;
        end if;
    end if;

end //
delimiter ;

-- [10] remove_account_access()
-- Remove a customer's account access. If they are the last customer with access to the account, close the account
-- When just revoking access:
    -- If the person revoking access is not an admin or someone with access to the account then don't change the database state
    -- Otherwise, remove the designated sharer from the existing account
-- When closing the account:
    -- If the customer to be removed from the account is NOT the last remaining owner/sharer then don't close the account
    -- If the person closing the account is not an admin or someone with access to the account then don't change the database state
    -- Otherwise, the account must be closed
drop procedure if exists remove_account_access;
delimiter //
create procedure remove_account_access (in ip_requester varchar(100), in ip_sharer varchar(100),
    in ip_bankID varchar(100), in ip_accountID varchar(100))
begin
    -- Check that requester is admin or has access to said account
    if (ip_requester in (select perID from system_admin) or ip_requester in (select perID from access where accountID = ip_accountID and bankID = ip_bankID)) then
        -- If there are multiple people on an account, just remove access
        if (select count(*) from access where bankID = ip_bankID and accountID = ip_accountID group by bankID, accountID) > 1 then
            delete from access where perID = ip_sharer and bankID = ip_bankID and accountID = ip_accountID;
        else -- else close account
            delete from access where perID = ip_sharer and bankID = ip_bankID and accountID = ip_accountID;
            delete from checking where bankID = ip_bankID and accountID = ip_accountID;
            delete from market where bankID = ip_bankID and accountID = ip_accountID;
            delete from savings where bankID = ip_bankID and accountID = ip_accountID;
            delete from interest_bearing where bankID = ip_bankID and accountID = ip_accountID;
            delete from bank_account where bankID = ip_bankID and accountID = ip_accountID;
        end if;
    end if;
end //
delimiter ;

-- [11] create_fee()
drop procedure if exists create_fee;
delimiter //
create procedure create_fee (in ip_bankID varchar(100), in ip_accountID varchar(100),
    in ip_fee_type varchar(100))
begin
    insert into interest_bearing_fees (BankID, accountID, fee) values (ip_bankID, ip_accountID, ip_fee_type);
end //
delimiter ;

-- [12] start_overdraft()
drop procedure if exists start_overdraft;
delimiter //
create procedure start_overdraft (in ip_requester varchar(100),
    in ip_checking_bankID varchar(100), in ip_checking_accountID varchar(100),
    in ip_savings_bankID varchar(100), in ip_savings_accountID varchar(100))
begin
    if (ip_requester in (select perID from system_admin)
            or    (ip_requester in (select perID from access where bankID = ip_checking_bankID and accountID = ip_checking_accountID)
            and ip_requester in (select perID from access where bankID = ip_savings_bankID and accountID = ip_savings_accountID))) then
        update checking set protectionBank = ip_savings_bankID, protectionAccount = ip_savings_accountID where bankID = ip_checking_bankID and accountID = ip_checking_accountID;
    end if;
end //
delimiter ;

-- [13] stop_overdraft()
drop procedure if exists stop_overdraft;
delimiter //
create procedure stop_overdraft (in ip_requester varchar(100),
    in ip_checking_bankID varchar(100), in ip_checking_accountID varchar(100))
begin
    if (ip_requester in (select * from system_admin) or ip_requester in (select perID from access where bankID = ip_checking_bankID and accountID = ip_checking_accountID)) then
        update checking set protectionBank = null, protectionAccount = null where bankID = ip_checking_bankID and accountID = ip_checking_accountID;
    end if;
end //
delimiter ;

-- [14] account_deposit()
-- If the person making the deposit does not have access to the account then don't change the database state
-- Otherwise, the account balance and related info must be modified appropriately
drop procedure if exists account_deposit;
delimiter //
create procedure account_deposit (in ip_requester varchar(100), in ip_deposit_amount integer,
    in ip_bankID varchar(100), in ip_accountID varchar(100), in ip_dtAction date)
sp_main: begin
    if ip_requester not in (select perID from access where ip_bankID = bankID and ip_accountID = accountID) then leave sp_main; end if;
    update bank_account set balance = balance + ip_deposit_amount where ip_bankID = bankID and ip_accountID = accountID;
    update access set dtAction = ip_dtAction where ip_requester = perID and ip_bankID = bankID and ip_accountID = accountID;
end //
delimiter ;

-- [15] account_withdrawal()
-- If the person making the withdrawal does not have access to the account then don't change the database state
-- If the withdrawal amount is more than the account balance for a savings or market account then don't change the database state [the account balance must be positive]
-- If the withdrawal amount is more than the account balance + the overdraft balance (i.e., from the designated savings account) for a checking account then don't change the database state [the account balance must be positive]
-- Otherwise, the account balance and related info must be modified appropriately (amount deducted from the primary account first, and second from the overdraft account as needed)
drop procedure if exists account_withdrawal;
delimiter //
create procedure account_withdrawal (in ip_requester varchar(100), in ip_withdrawal_amount integer,
    in ip_bankID varchar(100), in ip_accountID varchar(100), in ip_dtAction date)
sp_main: begin
    -- If the person making the withdrawal does not have access to the account then don't change the database state
    if ip_requester not in (select perID from access where ip_bankID = bankID and ip_accountID = accountID) then
        leave sp_main;
    end if;
    
    -- Checks if there is a protection account
    if exists (select protectionBank from checking where ip_bankID = bankID and ip_accountID = accountID) then
        -- Checks if the withdrawal amount is less than the account + the overdraft account combined
        if (select coalesce(bank_account.balance, 0) - ip_withdrawal_amount + coalesce(overdraft_acct.balance, 0) from bank_account
                join checking on bank_account.bankID = checking.bankID and bank_account.accountID = checking.accountID
                join bank_account as overdraft_acct on checking.protectionBank = overdraft_acct.bankID and checking.protectionAccount = overdraft_acct.accountID
                where ip_bankID = bank_account.bankID and ip_accountID = bank_account.accountID) < 0 then
            leave sp_main;
        end if;
        
        -- If there is an overdraft, update the values
        if (select coalesce(balance, 0) - ip_withdrawal_amount from bank_account where ip_bankID = bankID and ip_accountID = accountID) < 0 then
            -- Update protection account balance
            update bank_account join checking on bank_account.bankID = checking.bankID and bank_account.accountID = checking.accountID
                join bank_account as overdraft_acct on checking.protectionBank = overdraft_acct.bankID and checking.protectionAccount = overdraft_acct.accountID
                set overdraft_acct.balance = coalesce(overdraft_acct.balance, 0) - (ip_withdrawal_amount - coalesce(bank_account.balance, 0)) where ip_bankID = bank_account.bankID and ip_accountID = bank_account.accountID;
                
            -- Update overdrafted amount
            update checking join bank_account on bank_account.bankID = checking.bankID and bank_account.accountID = checking.accountID
                set amount = ip_withdrawal_amount - coalesce(bank_account.balance, 0), dtOverdraft = ip_dtAction
                where ip_bankID = bank_account.bankID and ip_accountID = bank_account.accountID;
                
            -- Update overdrafted account
            update bank_account set balance = 0
                where ip_bankID = bank_account.bankID and ip_accountID = bank_account.accountID;
                
            -- Update access date of checking account
            update access set dtAction = ip_dtAction
                where ip_requester = perID and ip_bankID = bankID and ip_accountID = accountID;
                
             -- Update access date of protection account
            update access join checking on access.bankID = checking.bankID and access.accountID = checking.accountID
                join bank_account on checking.protectionBank = bank_account.bankID and checking.protectionAccount = bank_account.accountID
                join access as overdraft_acct on checking.protectionBank = overdraft_acct.bankID and checking.protectionAccount = overdraft_acct.accountID
                set overdraft_acct.dtAction = ip_dtAction
                where ip_requester = access.perID and ip_bankID = checking.bankID and ip_accountID = checking.accountID;
    
        end if;
    end if;

    -- Checks if the balance in acct has enough money
    if (select coalesce(balance) - ip_withdrawal_amount from bank_account where ip_bankID = bankID and ip_accountID = accountID) < 0 then
        leave sp_main;
    end if;
    update bank_account set balance = coalesce(balance, 0) - ip_withdrawal_amount where ip_bankID = bankID and ip_accountID = accountID;
    update access set dtAction = ip_dtAction where ip_requester = perID and ip_bankID = bankID and ip_accountID = accountID;
    
    if exists (select * from market where ip_bankID = bankID and ip_accountID = accountID) then
        update market set numWithdrawals = numWithdrawals + 1 where ip_bankID = bankID and ip_accountID = accountID;
    end if;
                
end //
delimiter ;

-- [16] account_transfer()
-- If the person making the transfer does not have access to both accounts then don't change the database state
-- If the withdrawal amount is more than the account balance for a savings or market account then don't change the database state [the account balance must be positive]
-- If the withdrawal amount is more than the account balance + the overdraft balance (i.e., from the designated savings account) for a checking account then don't change the database state [the account balance must be positive]
-- Otherwise, the account balance and related info must be modified appropriately (amount deducted from the withdrawal account first, and second from the overdraft account as needed, and then added to the deposit account)
drop procedure if exists account_transfer;
delimiter //
create procedure account_transfer (in ip_requester varchar(100), in ip_transfer_amount integer,
    in ip_from_bankID varchar(100), in ip_from_accountID varchar(100),
    in ip_to_bankID varchar(100), in ip_to_accountID varchar(100), in ip_dtAction date)
sp_main: begin
    if ip_requester not in (select perID from access where (ip_from_bankID = bankID and ip_from_accountID = accountID))
    or ip_requester not in (select perID from access where (ip_to_bankID = bankID and ip_to_accountID = accountID)) then
        leave sp_main;
    end if;
    
    if exists (select protectionBank from checking where ip_from_bankID = bankID and ip_from_accountID = accountID) then -- checks for protection account
        if (select bank_account.balance - ip_transfer_amount + overdraft_acct.balance as new_bal from
                bank_account join checking on bank_account.bankID = checking.bankID and bank_account.accountID = checking.accountID
                join bank_account as overdraft_acct on checking.protectionBank = overdraft_acct.bankID and checking.protectionAccount = overdraft_acct.accountID
                where ip_from_bankID = bank_account.bankID and ip_from_accountID = bank_account.accountID) < 0 then
            leave sp_main;
        end if;
        -- remove balance from checking then from protection account
        if (select balance - ip_transfer_amount from bank_account where ip_from_bankID = bankID and ip_from_accountID = accountID) < 0 then
            -- Update protection account balance
            update bank_account join checking on bank_account.bankID = checking.bankID and bank_account.accountID = checking.accountID
                join bank_account as overdraft_acct on checking.protectionBank = overdraft_acct.bankID and checking.protectionAccount = overdraft_acct.accountID
                set overdraft_acct.balance = overdraft_acct.balance - (ip_transfer_amount - bank_account.balance)
                where ip_from_bankID = bank_account.bankID and ip_from_accountID = bank_account.accountID;
                
            -- Update overdrafted amount
            update checking join bank_account on bank_account.bankID = checking.bankID and bank_account.accountID = checking.accountID
                set amount = ip_transfer_amount - bank_account.balance, dtOverdraft = ip_dtAction
                where ip_from_bankID = bank_account.bankID and ip_from_accountID = bank_account.accountID;
                
            -- Update overdrafted account
            update bank_account set balance = 0
                where ip_from_bankID = bank_account.bankID and ip_from_accountID = bank_account.accountID;
                
            -- Update balance of account transferred to
            update bank_account set balance = coalesce(balance, 0) + ip_transfer_amount
                where ip_to_bankID = bankID and ip_to_accountID = accountID;
                
            -- Update access date of checking account
            update access set dtAction = ip_dtAction
                where ip_requester = perID and ip_from_bankID = bankID and ip_from_accountID = accountID;
                
            -- Update access date of protection account
            update access join checking on access.bankID = checking.bankID and access.accountID = checking.accountID
                join bank_account on checking.protectionBank = bank_account.bankID and checking.protectionAccount = bank_account.accountID
                join access as overdraft_acct on checking.protectionBank = overdraft_acct.bankID and checking.protectionAccount = overdraft_acct.accountID
                set overdraft_acct.dtAction = ip_dtAction
                where ip_requester = access.perID and ip_from_bankID = bank_account.bankID and ip_from_accountID = bank_account.accountID;
                
            -- Update access date of account transferred to
            update access set dtAction = ip_dtAction
                where ip_requester = perID and ip_to_bankID = bankID and ip_to_accountID = accountID;

        end if;
    end if;
    
    if (select balance - ip_transfer_amount from bank_account where ip_from_bankID = bankID and ip_from_accountID = accountID) < 0 then
        leave sp_main;
    end if;
    update bank_account set balance = coalesce(balance, 0) - ip_transfer_amount where ip_from_bankID = bankID and ip_from_accountID = accountID;
    update access set dtAction = ip_dtAction where ip_requester = perID and ip_from_bankID = bankID and ip_from_accountID = accountID;
    update bank_account set balance = coalesce(balance, 0) + ip_transfer_amount where ip_to_bankID = bankID and ip_to_accountID = accountID;
    update access set dtAction = ip_dtAction where ip_to_bankID = bankID and ip_to_accountID = accountID;
    
end //
delimiter ;

-- [17] pay_employees()
-- Increase each employee's pay earned so far by the monthly salary
-- Deduct the employee's pay from the banks reserved assets
-- If an employee works at more than one bank, then deduct the (evenly divided) monthly pay from each of the affected bank's reserved assets
-- Truncate any fractional results to an integer before further calculations
drop procedure if exists pay_employees;
delimiter //
create procedure pay_employees ()
sp_main: begin
	-- Update employee payments and earned
    update employee set payments = coalesce(payments, 0) + 1;
    update employee set earned = earned + coalesce(salary,0);
    
    -- Update bank reserved assets
    update bank as b1, (select bank.bankID, resAssets, coalesce(resAssets, 0) - sum(coalesce(sal, 0)) as new_resAssets from bank join workfor on bank.bankID = workFor.bankID
		join employee on workfor.perID = employee.perID
		join (select workfor.perId, truncate(salary/count(*), 0) as sal from workfor
		join employee on workfor.perID = employee.perID group by workfor.perID) as count on workFor.perID = count.perID
		group by bank.bankID) as b2
		set b1.resAssets = b2.new_resAssets
		where b1.bankID = b2.bankID;
        
end //
delimiter ;

-- [18] penalize_accounts()
-- For each savings account that is below the minimum balance, deduct the smaller of $100 or 10% of the current balance from the account
-- For each market account that has exceeded the maximum number of withdrawals, deduct the smaller of $500 per excess withdrawal or 20% of the current balance from the account
-- Add all deducted amounts to the reserved assets of the bank that owns the account
-- Truncate any fractional results to an integer before further calculations
drop procedure if exists penalize_accounts;
delimiter //
create procedure penalize_accounts ()
begin
	update bank set resAssets = coalesce(resAssets, 0);
    update bank_account join savings on bank_account.accountID = savings.accountID and bank_account.bankID = savings.bankID
        join bank on bank_account.bankID = bank.bankID
        set resAssets =
            case
                when (ifnull(balance, 0) < ifnull(minBalance, 0) and truncate(0.10 * balance, 0) < 100) then ifnull(resAssets, 0) + ifnull(truncate(0.10 * balance, 0), 0)
                when (ifnull(balance, 0) < ifnull(minBalance, 0) and truncate(0.10 * balance, 0) >= 100) then ifnull(resAssets, 0) + 100
                else ifnull(resAssets, 0)
            end;

    update bank_account join market on bank_account.accountID = market.accountID and bank_account.bankID = market.bankID
        join bank on bank_account.bankID = bank.bankID
        set resAssets =
            case
                when ifnull(numWithdrawals, 0) > ifnull(maxWithdrawals, 0) and truncate(0.20 * balance, 0) < (numWithdrawals - maxWithdrawals) * 500 then ifnull(resAssets, 0) + ifnull(truncate(0.20 * balance, 0), 0)
                when ifnull(numWithdrawals, 0) > ifnull(maxWithdrawals, 0) and truncate(0.20 * balance, 0) >= (numWithdrawals - maxWithdrawals) * 500 then ifnull(resAssets, 0) + ifnull((numWithdrawals - maxWithdrawals), 0) * 500
                else ifnull(resAssets, 0)
            end;

	# Update savings balance
    update bank_account join savings on bank_account.accountID = savings.accountID and bank_account.bankID = savings.bankID
        set balance =
            case
                when ifnull(balance, 0) < ifnull(minBalance, 0) and truncate(0.10 * balance, 0) < 100 then ifnull(balance, 0) - ifnull(truncate(0.10 * balance, 0), 0)
                when ifnull(balance, 0) < ifnull(minBalance, 0) and truncate(0.10 * balance, 0) >= 100 then ifnull(balance, 0) - 100
                else ifnull(balance, 0)
            end;

	# Update market balance
    update bank_account join market on bank_account.accountID = market.accountID and bank_account.bankID = market.bankID
        set balance =
            case
                when ifnull(numWithdrawals, 0) > ifnull(maxWithdrawals, 0) and truncate(0.20 * balance, 0) < (ifnull(numWithdrawals, 0) - ifnull(maxWithdrawals, 0)) * 500 then ifnull(balance, 0) - ifnull(truncate(0.20 * balance, 0), 0)
                when ifnull(numWithdrawals, 0) > ifnull(maxWithdrawals, 0) and truncate(0.20 * balance, 0) >= (ifnull(numWithdrawals, 0) - ifnull(maxWithdrawals, 0)) * 500 then ifnull(balance, 0) - ifnull((numWithdrawals - maxWithdrawals) * 500, 0)
                else ifnull(balance, 0)
            end;

end //

delimiter ;

-- [19] accrue_interest()
-- For each interest-bearing account that is "in good standing", increase the balance based on the designated interest rate
-- A savings account is "in good standing" if the current balance is equal to or above the designated minimum balance
-- A market account is "in good standing" if the current number of withdrawals is less than or equal to the maximum number of allowed withdrawals
-- Subtract all paid amounts from the reserved assets of the bank that owns the account                                                                       
-- Truncate any fractional results to an integer before further calculations
drop procedure if exists accrue_interest;
delimiter //
create procedure accrue_interest ()
begin
    update bank set resAssets = ifnull(resAssets, 0);
    update interest_bearing set interest_rate = ifnull(interest_rate, 0);
    
    # Update bank resAssets for savings interest
    update bank_account join savings on bank_account.accountID = savings.accountID and bank_account.bankID = savings.bankID
        join interest_bearing on bank_account.accountID = interest_bearing.accountID and bank_account.bankID = interest_bearing.bankID
        join bank on bank_account.bankID = bank.bankID
        set resAssets =
            case
                when ifnull(balance, 0) >= ifnull(minBalance, 0) then resAssets - truncate((interest_rate/100) * ifnull(balance, 0), 0)
                else resAssets
            end;
	
    # Update bank resAssets for markte interest
    update bank_account join market on bank_account.accountID = market.accountID and bank_account.bankID = market.bankID
        join interest_bearing on bank_account.accountID = interest_bearing.accountID and bank_account.bankID = interest_bearing.bankID
        join bank on bank_account.bankID = bank.bankID
        set resAssets =
            case
                when ifnull(numWithdrawals, 0) <= ifnull(maxWithdrawals, 0) then resAssets - truncate((interest_rate/100) * ifnull(balance, 0), 0)
                else resAssets
            end;

	# Update savings balance 
    update bank_account join savings on bank_account.accountID = savings.accountID and bank_account.bankID = savings.bankID
        join interest_bearing on savings.accountID = interest_bearing.accountID and savings.bankID = interest_bearing.bankID
        set balance =
            case
                when ifnull(balance, 0) >= minBalance then balance + truncate((interest_rate/100) * balance, 0)
                else balance
            end;
    
    update bank_account join market on bank_account.accountID = market.accountID and bank_account.bankID = market.bankID
        join interest_bearing on market.accountID = interest_bearing.accountID and market.bankID = interest_bearing.bankID
        set balance =
            case
                when ifnull(numWithdrawals, 0) <= ifnull(maxWithdrawals, 0) then balance + truncate((interest_rate/100) * balance, 0)
                else balance
            end;
end //
delimiter ;

-- [20] display_account_stats()
-- Display the simple and derived attributes for each account, along with the owning bank
create or replace view display_account_stats as
select bank.bankName as name_of_bank, bank_account.accountID as account_identifier, bank_account.balance as account_assets, count(*) as number_of_owners
from bank_account, bank, access
where bank_account.bankID = bank.bankID and access.accountID = bank_account.accountID and access.bankID = bank_account.bankID
group by bank_account.bankID, bank_account.accountID;


-- [21] display_bank_stats()
-- Display the simple and derived attributes for each bank, along with the owning corporation
create or replace view display_bank_stats as
select bank.bankID as bank_identifier, shortName as name_of_corporation, bankName as name_of_bank, street, city, state, zip,
    num_accts as number_of_accounts, bank.resAssets as bank_assets, coalesce(coalesce(total_bal, 0) + coalesce(bank.resAssets, 0), 0)  as total_assets
from bank join corporation on bank.corpID = corporation.corpID
left join (select bank_account.bankID, count(*) as num_accts, sum(balance) as total_bal from bank_account group by bankID) as acct on acct.bankID = bank.bankID;

-- [22] display_corporation_stats()
-- Display the simple and derived attributes for each corporation
create or replace view display_corporation_stats as
select corporation.corpID as corporation_identifier, shortName as short_name, longName as formal_name, num_banks as number_of_banks,
    corporation.resAssets as corporation_assets, corporation.resAssets + coalesce(bank_assets, 0) as total_assets
from corporation left join (select bank.corpID, bank.bankID, count(*) as num_banks, bank_assets from bank
left join (select corpID, coalesce(sum(resAssets), 0) + coalesce(sum(acct_bal), 0) as bank_assets from bank
left join (select bankID, sum(balance) as acct_bal from bank_account group by bankID) as acct on acct.bankID = bank.bankID group by corpID)
as bank_money on bank_money.corpID = bank.corpID
group by bank.corpID) as banks on banks.corpID = corporation.corpID;


-- [23] display_customer_stats()
-- Display the simple and derived attributes for each customer
create or replace view display_customer_stats as
select bank_user.perID as person_identifier, taxID as tax_identifier, concat_ws(" ", firstName, lastName) as customer_name, birthdate as date_of_birth,
        dtJoined as joined_system, street, city, state, zip, num_accts as number_of_accounts, coalesce(total_bal, 0) as customer_assets
    from bank_user join customer on bank_user.perID = customer.perID
    left join (select perID, count(*) as num_accts, sum(balance) as total_bal from access
    join bank_account on access.bankID = bank_account.bankID and access.accountID = bank_account.accountID group by perID) as acct on acct.perID = bank_user.perID;

-- [24] display_employee_stats()
-- Display the simple and derived attributes for each employee
create or replace view display_employee_stats as 
select employee.perID as person_identification, taxID as tax_identification, concat(firstName," ",lastName) as employee_name, birthdate as date_of_birth,
dtJoined as joined_system, street, city, state, zip, num_banks as number_of_banks, bank_assets
from bank_user join employee on bank_user.perID = employee.perID 
left join (select employee.perID, count(*) as num_banks from workFor join employee on employee.perID = workFor.perID group by perID) as nums on employee.perID = nums.perID -- ;
left join (select employee.perID, sum(total_assets) as bank_assets from employee left join workFor on employee.perID = workFor.perID
left join (select bank.bankID as bank_identifier,
coalesce(coalesce(total_bal, 0) + coalesce(bank.resAssets, 0), 0)  as total_assets
from bank
left join (select bank_account.bankID, sum(balance) as total_bal from bank_account group by bankID) as acct on acct.bankID = bank.bankID) as bac on workFor.bankID = bac.bank_identifier group by perID) as temp on temp.perID = nums.perID;
