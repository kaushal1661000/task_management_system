import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User } from '@/types';

interface EmployeeMultiSelectDropdownProps {
    employees: User[];
    selectedIds: string[];
    onChange: (ids: string[]) => void;
}

export default function EmployeeMultiSelectDropdown({
    employees,
    selectedIds,
    onChange,
}: EmployeeMultiSelectDropdownProps) {
    const toggleEmployee = (employeeId: string) => {
        if (selectedIds.includes(employeeId)) {
            onChange(selectedIds.filter((id) => id !== employeeId));

            return;
        }

        onChange([...selectedIds, employeeId]);
    };

    const selectedEmployees = employees.filter((employee) =>
        selectedIds.includes(String(employee.id)),
    );

    return (
        <div className="space-y-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between"
                    >
                        <span className="truncate text-left">
                            {selectedIds.length > 0
                                ? `${selectedIds.length} member${selectedIds.length > 1 ? 's' : ''} selected`
                                : 'Select team members'}
                        </span>
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="start"
                    className="w-(--radix-dropdown-menu-trigger-width) max-h-72 overflow-y-auto"
                >
                    <DropdownMenuLabel>Team Members</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {employees.map((employee) => {
                        const employeeId = String(employee.id);
                        const checked = selectedIds.includes(employeeId);

                        return (
                            <DropdownMenuCheckboxItem
                                key={employeeId}
                                checked={checked}
                                onSelect={(event) => event.preventDefault()}
                                onCheckedChange={() => toggleEmployee(employeeId)}
                            >
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-900">{employee.name}</span>
                                    <span className="text-xs text-gray-500">{employee.email}</span>
                                </div>
                            </DropdownMenuCheckboxItem>
                        );
                    })}
                </DropdownMenuContent>
            </DropdownMenu>

            {selectedEmployees.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedEmployees.map((employee) => (
                        <span
                            key={String(employee.id)}
                            className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                        >
                            {employee.name}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}