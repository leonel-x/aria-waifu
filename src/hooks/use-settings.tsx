import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { UserSettings, InsertUserSettings } from "@shared/schema";

export function useSettings() {
  const queryClient = useQueryClient();

  const { data: settings } = useQuery<UserSettings>({
    queryKey: ["/api/settings"]
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: InsertUserSettings) => {
      const response = await apiRequest("PUT", "/api/settings", newSettings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    }
  });

  const updateSettings = (newSettings: InsertUserSettings) => {
    updateSettingsMutation.mutate(newSettings);
  };

  return {
    settings,
    updateSettings,
    isUpdating: updateSettingsMutation.isPending
  };
}
